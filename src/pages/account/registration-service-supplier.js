import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { FieldText, FieldTextarea } from 'components/form';
import { finishAgentRegistration } from './registration-manager';
import Breadcrumbs from 'components/breadcrumbs';
import ActionSteps from 'components/action-steps';
import { CachedForm } from 'components/form';
import { registerContractManagerMaster } from 'providers/api';
import { registrationServiceSupplierValidator } from './registration-service-supplier-validator';
import View from 'matsumoto/src/stores/view-store';
import store from 'stores/auth-store';

@observer
class RegistrationServiceSupplier extends React.Component {
    @observable redirectToIndexPage = false;

    @action
    submit = (values) => {
        store.setRegistrationCounterpartyForm(values);
        registerContractManagerMaster({
            body: {
                manager: store.registration.agent,
                serviceSupplier: store.registration.counterparty
            }
        })
        .then(
            () => {
                finishAgentRegistration();
                this.redirectToIndexPage = true;
            },
            (error) => {
                View.setTopAlertText(error?.title || error?.detail);
            }
        )
    }

    render() {
        let { t } = useTranslation();

        if (this.redirectToIndexPage) {
            return <Redirect push to="/"/>;
        }

        return (
            <div className="account block sign-up-page">
                <section>
                    <div className="logo-wrapper">
                        <div className="logo" />
                    </div>
                    <div className="middle-section">
                        <Breadcrumbs items={[
                            {
                                text: t('Log In'),
                                link: '/logout'
                            }, {
                                text: t('Registration'),
                                link: '/logout'
                            }, {
                                text: t('Service Supplier Information')
                            }
                        ]}/>
                        <ActionSteps
                            items={[
                                t('Log In Information'),
                                t('Manager Information'),
                                t('Service Supplier Information')
                            ]}
                            current={2}
                            addclassName="action-steps-another-bg"
                        />
                        <h1>
                            Company Information
                        </h1>
                        <p>
                            Finish your registration in Property Management System.
                        </p>

                        <CachedForm
                            initialValues={{
                                name: '',
                                address: '',
                                postalCode: '',
                                phone: '',
                                website: ''
                            }}
                            validationSchema={registrationServiceSupplierValidator}
                            onSubmit={this.submit}
                            render={(formik) => (
                                <React.Fragment>
                                    <div className="form">
                                        <div className="row">
                                            <FieldText
                                                formik={formik}
                                                id="name"
                                                label="Service Supplier Name"
                                                placeholder="Service Supplier Name"
                                                required
                                            />
                                        </div>
                                        <div className="row">
                                            <FieldTextarea
                                                formik={formik}
                                                id="address"
                                                label="Service Supplier Address"
                                                placeholder="Service Supplier Address"
                                                required
                                            />
                                        </div>
                                        <div className="row">
                                            <FieldText
                                                formik={formik}
                                                id="postalCode"
                                                label="Zip/Postal Code"
                                                placeholder="Zip/Postal Code"
                                            />
                                        </div>
                                        <div className="row">
                                            <FieldText
                                                formik={formik}
                                                id="phone"
                                                label="Phone Number"
                                                placeholder="Phone Number"
                                                required
                                            />
                                        </div>
                                        <div className="row">
                                            <FieldText
                                                formik={formik}
                                                id="website"
                                                label="Website"
                                                placeholder="Website"
                                            />
                                        </div>
                                        <div className="row submit-holder">
                                            <div className="field">
                                                <div className="inner">
                                                    <button
                                                        type="submit"
                                                        className={'button' + __class(!formik.isValid, 'disabled')}>
                                                        {t('Get started')}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="field terms">
                                                By clicking this button, you agree with
                                                {' '}
                                                <a href="https://happytravel.com/terms"
                                                   target="_blank"
                                                   rel="noreferrer"
                                                   className="link">
                                                    HappyTravel’s Terms of Use.
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )}
                        />
                    </div>
                </section>
            </div>
        );
    }
}

export default RegistrationServiceSupplier;
