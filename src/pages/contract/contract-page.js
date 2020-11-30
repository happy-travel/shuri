import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import {
    CachedForm, FieldSelect,
    FieldText
} from 'matsumoto/src/components/form';
import View from 'matsumoto/src/stores/view-store';
import FieldDatepicker from 'matsumoto/src/components/complex/field-datepicker';
import { Loader } from 'matsumoto/src/simple/components/loader';
import Document from 'pages/contract/document';
import Menu from 'parts/menu';
import Dropzone from 'parts/uploads/dropzone';
import UploadModal from 'parts/uploads/upload-modal';
import UI from 'stores/shuri-ui-store';
import EntitiesStore from 'stores/shuri-entities-store';
import DialogModal from 'parts/dialog-modal';
import {
    getContract,
    createContract,
    updateContract,
    removeContract,
    getAccommodations,
    API_BASE_PATH,
    CONTRACTS_PATH
} from 'providers/api';
import UploadManager from 'managers/upload-manager';
import { parseBackendErrors, UPLOAD_ABORTED } from 'utils/error-utils';
import { formatDate } from 'utils/date-utils';

const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024;

@observer
class ContractPage extends React.Component {
    @observable contract;
    @observable accommodationsList;
    @observable id = this.props.match.params.id;
    @observable redirectUrl;
    @observable isRequestingApi = false;
    @observable isRemoveModalShown = false;
    @observable uploadManager;
    @observable downloadedFile;
    @observable formik;

    get uploadUrl() {
        return `${API_BASE_PATH}${CONTRACTS_PATH}/${this.id}/file`;
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match.params.id;
        const id = this.props.match.params.id;

        if (prevId !== id) {
            this.id = id;
            this.loadData();
        }
    }

    @action
    loadData = () => {
        getAccommodations().then(this.getAccommodationsSuccess);

        if (!this.id || EntitiesStore.hasContract(this.id)) {
            this.contract = !this.id ? {} : EntitiesStore.getContract(this.id);
        } else {
            getContract({
                urlParams: { id: this.id }
            }).then(this.getContractSuccess);
        }
    }

    @action
    getAccommodationsSuccess = (accommodationsList) => {
        this.accommodationsList = accommodationsList;
    }

    @action
    getContractSuccess = (contract) => {
        this.contract = contract;
        EntitiesStore.setContract(contract);
    }

    @action
    setRedirectUrl = () => {
        this.redirectUrl = '/contracts';
    }

    @action
    setRequestingApiStatus = () => {
        this.isRequestingApi = true;
    }

    @action
    unsetRequestingApiStatus = () => {
        this.isRequestingApi = false;
    }

    uploadFiles = () => {
        this.uploadManager.uploadFiles().then(this.onUploadFinish, this.uploadFilesFail);
    }

    uploadFilesFail = (error) => {
        if (error?.data.errorId === UPLOAD_ABORTED) {
            this.onUploadFinish(this.props.t('Some files were uploaded'));
        }
    }

    @action
    onUploadFinish = (message) => {
        if (this.uploadManager?.didUploadFiles) {
            getContract({ urlParams: { id: this.id } })
                .then(this.getContractSuccess)
                .then(() => {
                    if (message) {
                        View.setTopAlertText(message);
                    }
                });
        }
        this.uploadManager = undefined;
    }

    @action
    onOpenRemoveModal = () => {
        this.isRemoveModalShown = true;
    }

    @action
    onCloseRemoveModal = () => {
        this.isRemoveModalShown = false;
    }

    onCreateSubmit = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        const contract = formatValues(values);
        this.setRequestingApiStatus();
        createContract({ body: contract })
            .then(() => this.contractActionSuccess(contract), this.contractActionFail);
    }

    onUpdateSubmit = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        const contract = formatValues(values);
        this.setRequestingApiStatus();
        updateContract({
            urlParams: {
                id: this.id
            },
            body: contract
        }).then(() => this.contractActionSuccess(contract), this.contractActionFail);
    }

    contractActionSuccess = (contract) => {
        this.unsetRequestingApiStatus();
        this.setRedirectUrl();
        EntitiesStore.setContract(contract);
    }

    contractActionFail = (errorData) => {
        this.unsetRequestingApiStatus();
        parseBackendErrors(errorData).forEach((error) => {
            this.formik.setFieldError(error.path, error.message);
        })
        this.forceUpdate();
    }

    onContractRemove = () => {
        this.isRequestingApi = true;
        removeContract({
            urlParams: {
                id: this.id
            }
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onDrop = (files) => {
        this.uploadManager = new UploadManager(files, this.uploadUrl);
    }

    onCloseModal = () => {
        this.onUploadFinish(this.props.t('Some files were uploaded'));
    }

    onAbort = () => {
        setTimeout(this.uploadManager.abort());
    }

    onDocumentRemove = () => {
        getContract({ urlParams: { id: this.id } }).then(this.getContractSuccess);
    }

    @action
    renderForm = (formik) => {
        const { t } = this.props;
        this.formik = formik;
        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="name"
                        label="Name"
                        placeholder={t('Enter name')}
                        required
                    />
                    <FieldDatepicker
                        formik={formik}
                        label="Validity Dates"
                        id="validityDates"
                        first="validFrom"
                        second="validTo"
                        placeholder={t('Choose date')}
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="accommodationId"
                        label={t('Accommodation')}
                        placeholder="Select contract accommodation"
                        options={
                            this.accommodationsList?.map((item) => ({
                                value: item.id,
                                text: item.name[UI.editorLanguage]
                            }))
                        }
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="description"
                        label="Description"
                        placeholder="Enter contract description"
                        required
                    />
                </div>
                <div className="row controls">
                    <div className="field">
                        <div className="row">
                            <button
                                type="submit"
                                className="button"
                            >
                                {this.id ? t('Save changes') : t('Create')}
                            </button>
                            {this.id ?
                                <button
                                    type="button"
                                    onClick={this.onOpenRemoveModal}
                                    className="button gray remove-button"
                                >
                                    {t('Remove contract')}
                                </button> :
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderDocument = (document) => {
        return (
            <Document
                document={document}
                contractId={this.id}
                onRemove={() => this.onDocumentRemove(document)}
            />
        );
    }

    renderDocuments = () => {
        const { t } = this.props;
        const { documents } = this.contract;
        const isDocumentsListEmpty = documents?.length === 0;
        return (
            <div className="documents">
                <h2>
                    <span className="brand">
                        {t('Documents')}
                    </span>
                </h2>
                {isDocumentsListEmpty ? t('No documents uploaded.') : documents.map(this.renderDocument)}
                <Dropzone
                    className="dropzone"
                    maxSize={MAX_DOCUMENT_SIZE}
                    onDrop={this.onDrop}
                >
                    <button className="button upload-documents-button">
                        {t('Upload documents')}
                    </button>
                </Dropzone>
            </div>
        );
    }

    renderUploadModal = () => {
        if (!this.uploadManager) {
            return null;
        }

        return (
            <UploadModal
                uploadManager={this.uploadManager}
                uploadFiles={this.uploadFiles}
                onCloseClick={this.uploadManager.isResolved ? this.onCloseModal : this.onAbort}
            />
        );
    }

    render() {
        const { t } = this.props;
        const isLoading = this.contract === undefined || this.accommodationsList === undefined;

        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <Menu match={this.props.match} />
                    <section>
                        {isLoading ?
                            <Loader /> :
                            <>
                                <h2>
                                    <span className="brand">
                                        {this.id ? `Edit contract #${this.id}` : t('Create new contract')}
                                    </span>
                                </h2>
                                {!this.accommodationsList?.length ?
                                    t('No accommodations found') :
                                    <CachedForm
                                        initialValues={this.contract}
                                        onSubmit={this.id ? this.onUpdateSubmit : this.onCreateSubmit}
                                        render={this.renderForm}
                                        enableReinitialize
                                    />
                                }
                                {this.id ? this.renderDocuments() : null}
                                {this.renderUploadModal()}
                            </>
                        }
                    </section>
                </div>
                {this.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing contract')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.isRequestingApi ? this.onContractRemove : undefined}
                    /> :
                    null
                }
            </>
        );
    }
}

function formatValues(values) {
    return {
        ...values,
        validFrom: formatDate(values.validFrom),
        validTo: formatDate(values.validTo)
    };
}

ContractPage.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(ContractPage);
