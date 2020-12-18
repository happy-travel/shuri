import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { getInvite, forgetInvite } from 'core/auth/invite';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { FieldText, FieldSelect } from 'components/form';
import { userAuthSetToStorage } from 'core/auth';
import Breadcrumbs from 'components/breadcrumbs';
import ActionSteps from 'components/action-steps';
import { CachedForm } from 'components/form';
import {
    registerContractManager,
    getInvitationData,
    getContractManager
} from 'providers/api';
import { registrationManagerValidator } from './registration-manager-validator';
import View from 'matsumoto/src/stores/view-store';
import store from 'stores/auth-store';

export const finishAgentRegistration = () => {
    getContractManager().then((user) => {
        userAuthSetToStorage(user);
        if (user?.email) {
            store.setUser(user);
        }
    });

    forgetInvite();
    store.setRegistrationUserForm({});
    store.setRegistrationCounterpartyForm({});
};

@observer
class RegistrationManager extends React.Component {
    @observable redirectToIndexPage = false;
    @observable redirectToThirdStep = false;
    @observable invitationCode = '';
    @observable initialValues = {
        title: '',
        firstName: '',
        lastName: '',
        position: '',
        phone: '',
        fax: ''
    };

    componentDidMount() {
        let invitationCode = getInvite();
        if (invitationCode) {
            getInvitationData({
                urlParams: {
                    invitationCode
                }
            }).then((data) => {
                this.invitationCode = invitationCode;
                this.initialValues = data;
            });
        }
    }

    @action
    submit = (values) => {
        store.setRegistrationUserForm(values);
        if (this.invitationCode) {
            /* todo body:
                {
                    registrationInfo: {
                        ...values,
                        email: this.state.initialValues.email
                    },
                    invitationCode: this.state.invitationCode
                }
             */
            registerContractManager({ body: values }).then(
                () => {
                    finishAgentRegistration();
                    this.redirectToIndexPage = true;
                },
                (error) => {
                    View.setTopAlertText(error?.title || error?.detail);
                    if (error && !(error?.title || error?.detail)) {
                        this.setState({
                            redirectToIndexPage: true
                        });
                    }
                }
            );
        } else if (!this.redirectToThirdStep) {
            this.redirectToThirdStep = true;
        }
    }

    render() {
        let { t } = useTranslation();

        if (this.redirectToThirdStep) {
            return <Redirect push to="/signup/service-supplier"/>;
        }

        if (this.redirectToIndexPage) {
            return <Redirect push to="/"/>;
        }

        const actionSteps = [t('Log In Information'), t('Manager Information')];
        if (!this.invitationCode) {
            actionSteps.push(t('Service Supplier Information'));
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
                                text: t('Manager Information')
                            }
                        ]}/>
                        <ActionSteps
                            items={actionSteps}
                            current={1}
                            addClass="action-steps-another-bg"
                        />
                        <h1>
                            Manager Information
                        </h1>
                        <p>
                            Finish your registration in Property Management System.
                        </p>

                        <CachedForm
                            initialValues={this.initialValues}
                            enableReinitialize
                            validationSchema={registrationManagerValidator}
                            onSubmit={this.submit}
                            render={(formik) => (
                                <div className="form">
                                    <div className="row">
                                        <FieldSelect
                                            formik={formik}
                                            id="title"
                                            label={t('Salutation')}
                                            required
                                            placeholder={t('Select One')}
                                            options={[
                                                { value: 'Mr', text: t('Mr.') },
                                                { value: 'Ms', text: t('Ms.') },
                                                { value: 'Miss', text: t('Miss') },
                                                { value: 'Mrs', text: t('Mrs.') }
                                            ]}
                                        />
                                    </div>
                                    <div className="row">
                                        <FieldText
                                            formik={formik}
                                            id="firstName"
                                            label={t('First Name')}
                                            placeholder={t('First Name')}
                                            required
                                        />
                                    </div>
                                    <div className="row">
                                        <FieldText
                                            formik={formik}
                                            id="lastName"
                                            label={t('Last Name')}
                                            placeholder={t('Last Name')}
                                            required
                                        />
                                    </div>
                                    <div className="row">
                                        <FieldText
                                            formik={formik}
                                            id="position"
                                            label={t('Position/Designation')}
                                            placeholder={t('Position/Designation')}
                                            required
                                        />
                                    </div>
                                    <div className="row">
                                        <FieldText
                                            formik={formik}
                                            id="phone"
                                            label={t('Phone')}
                                            placeholder={t('Phone')}
                                            numeric
                                            required
                                        />
                                    </div>
                                    <div className="row">
                                        <FieldText
                                            formik={formik}
                                            id="fax"
                                            label={t('Fax')}
                                            placeholder={t('Fax')}
                                            numeric
                                        />
                                    </div>
                                    <div className="row submit-holder">
                                        <div className="field">
                                            <div className="inner">
                                                <button type="submit" className="button">
                                                    { this.invitationCode ?
                                                        t('Finish Registration') :
                                                        t('Continue Registration')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                </section>
            </div>
        );
    }
}

export default RegistrationManager;
