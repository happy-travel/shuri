import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import propTypes from 'prop-types';
import {
    CachedForm, FieldSelect,
    FieldText
} from 'matsumoto/src/components/form';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import FieldDatepicker from 'matsumoto/src/components/complex/field-datepicker';
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';
import UI from 'stores/shuri-ui-store';
import DialogModal from 'parts/dialog-modal';

class ContractPage extends React.Component {
    state = {
        contract: {},
        accommodationsList: null,
        id: this.props.match.params.id,
        redirectUrl: undefined,
        isRequestingApi: false,
        isRemoveModalShown: false
    };

    componentDidMount() {
        const { id } = this.state;
        API.get({
            url: apiMethods.accommodationsList(),
            success: (accommodationsList) => this.setState({ accommodationsList })
        })

        if (!id) {
            return;
        }

        API.get({
            url: apiMethods.contractById(id),
            success: (contract) => {
                this.setState({ contract });
            }
        })
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

    onSubmit = (values) => {
        const { id } = this.state;
        const method = id ? 'put' : 'post';
        const url = id ? apiMethods.contractById(this.state.id) : apiMethods.contractsList();

        this.setState({ isRequestingApi: true });
        API[method]({
            url: url,
            body: values,
            success: () => {
                this.setState({ redirectUrl: '/contracts' });
            },
            after: () => {
                this.setState({ isRequestingApi: false })
            }
        })
    }

    onContractRemove = () => {
        this.setState({ isRequestingApi: true });
        API.delete({
            url: apiMethods.contractById(this.state.id),
            success: () => {
                this.setState({ redirectUrl: '/contracts' });
            },
            after: () => {
                this.setState({ isRequestingApi: false })
            }
        })
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="name"
                        label="Name"
                        placeholder={t('Enter name')}
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

    render() {
        const { t } = this.props;
        const { redirectUrl, id } = this.state;

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <section>
                        <Breadcrumbs
                            backLink={'/contracts'}
                            items={[
                                {
                                    text: 'Contracts list',
                                    link: '/contracts'
                                }, {
                                    text: 'Contract'
                                }
                            ]}
                        />
                        <h2>
                            <span className="brand">
                                {id ? `Edit contract #${id}` : t('Create new contract')}
                            </span>
                        </h2>
                        {!this.state.accommodationsList?.length ?
                            t('No contracts found') :
                            <CachedForm
                                initialValues={this.state.contract}
                                onSubmit={!this.state.isRequestingApi ? this.onSubmit : undefined}
                                render={this.renderForm}
                                enableReinitialize
                            />
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

ContractPage.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(ContractPage);
