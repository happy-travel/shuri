import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
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

class ContractPage extends React.Component {
    state = {
        contract: undefined,
        accommodationsList: undefined,
        id: this.props.match.params.id,
        redirectUrl: undefined,
        isRequestingApi: false,
        isRemoveModalShown: false,
        uploadManager: undefined,
        downloadedFile: undefined
    };
    formik;

    get uploadUrl() {
        return `${API_BASE_PATH}${CONTRACTS_PATH}/${this.state.id}/file`;
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match.params.id;
        const id = this.props.match.params.id;

        if (prevId !== id) {
            this.setState({ id }, this.loadData);
        }
    }

    loadData = () => {
        const { id } = this.state;

        getAccommodations().then(this.getAccommodationsSuccess);

        if (!id || EntitiesStore.hasContract(id)) {
            this.setState({ contract: !id ? {} : EntitiesStore.getContract(id) })
        } else {
            getContract({ urlParams: { id } }).then(this.getContractSuccess);
        }
    }

    getAccommodationsSuccess = (accommodationsList) => {
        this.setState({ accommodationsList });
    }

    getContractSuccess = (contract) => {
        this.setState({ contract });
        EntitiesStore.setContract(contract);
    }

    setRedirectUrl = () => {
        this.setState({ redirectUrl: '/contracts' });
    }

    setRequestingApiStatus = () => {
        this.setState({ isRequestingApi: true });
    }

    unsetRequestingApiStatus = () => {
        this.setState({ isRequestingApi: false });
    }

    uploadFiles = () => {
        this.state.uploadManager.uploadFiles().then(this.onUploadFinish, this.uploadFilesFail);
    }

    uploadFilesFail = (error) => {
        if (error?.data.errorId === UPLOAD_ABORTED) {
            this.onUploadFinish(this.props.t('Some files were uploaded'));
        }
    }

    onUploadFinish = (message) => {
        const { uploadManager } = this.state;
        if (uploadManager?.didUploadFiles) {
            getContract({ urlParams: { id: this.state.id } })
                .then(this.getContractSuccess)
                .then(() => {
                    if (message) {
                        View.setTopAlertText(message);
                    }
                });
        }
        this.setState({ uploadManager: undefined });
    }

    onOpenRemoveModal = () => {
        this.setState({
            isRemoveModalShown: true
        });
    }

    onCloseRemoveModal = () => {
        this.setState({
            isRemoveModalShown: false
        });
    }

    onCreateSubmit = (values) => {
        if (this.state.isRequestingApi) {
            return;
        }
        const contract = formatValues(values);
        this.setRequestingApiStatus();
        createContract({ body: contract })
            .then(() => this.contractActionSuccess(contract), this.contractActionFail);
    }

    onUpdateSubmit = (values) => {
        if (this.state.isRequestingApi) {
            return;
        }
        const contract = formatValues(values);
        this.setRequestingApiStatus();
        updateContract({
            urlParams: {
                id: this.state.id
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
        this.setState({ isRequestingApi: true });
        removeContract({
            urlParams: {
                id: this.state.id
            }
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onDrop = (files) => {
        this.setState({ uploadManager: new UploadManager(files, this.uploadUrl) });
    }

    onCloseModal = () => {
        this.onUploadFinish(this.props.t('Some files were uploaded'));
    }

    onAbort = () => {
        setTimeout(this.state.uploadManager.abort());
    }

    onDocumentRemove = () => {
        getContract({ urlParams: { id: this.state.id } }).then(this.getContractSuccess);
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
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
                            this.state.accommodationsList?.map((item) => ({
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
                                {id ? t('Save changes') : t('Create')}
                            </button>
                            {id ?
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
                contractId={this.state.id}
                onRemove={() => this.onDocumentRemove(document)}
            />
        );
    }

    renderDocuments = () => {
        const { t } = this.props;
        const { documents } = this.state.contract;
        const isDocumentsListEmpty = documents?.length === 0;
        return (
            <div className="documents">
                <h3>{t('Documents')}</h3>
                {isDocumentsListEmpty ? t('No documents uploaded.') : documents.map(this.renderDocument)}
                <Dropzone
                    className="dropzone"
                    maxSize={MAX_DOCUMENT_SIZE}
                    onDrop={this.onDrop}
                >
                    <button className="button small">
                        {t('Upload documents')}
                    </button>
                </Dropzone>
            </div>
        );
    }

    renderUploadModal = () => {
        const { uploadManager } = this.state;
        if (!uploadManager) {
            return null;
        }

        return (
            <UploadModal
                uploadManager={uploadManager}
                uploadFiles={this.uploadFiles}
                onCloseClick={uploadManager.isResolved ? this.onCloseModal : this.onAbort}
            />
        );
    }

    render() {
        const { t } = this.props;
        const { redirectUrl, id, contract, accommodationsList } = this.state;
        const isLoading = contract === undefined || accommodationsList === undefined;

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
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
                                        {id ? `Edit contract #${id}` : t('Create new contract')}
                                    </span>
                                </h2>
                                {!accommodationsList?.length ?
                                    t('No accommodations found') :
                                    <CachedForm
                                        initialValues={contract}
                                        onSubmit={id ? this.onUpdateSubmit : this.onCreateSubmit}
                                        render={this.renderForm}
                                        enableReinitialize
                                    />
                                }
                                {id ? this.renderDocuments() : null}
                                {this.renderUploadModal()}
                            </>
                        }
                    </section>
                </div>
                {this.state.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing contract')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.state.isRequestingApi ? this.onContractRemove : undefined}
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
