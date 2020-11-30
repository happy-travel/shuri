import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { FieldText, FieldSelect } from 'components/form';
import { userAuthSetToStorage } from 'core/auth';
import Breadcrumbs from 'components/breadcrumbs';
import ActionSteps from 'components/action-steps';
import { CachedForm } from 'components/form';
import { registerContractManager } from 'providers/api';
import { registrationManagerValidator } from './registration-manager-validator';

@observer
class RegistrationManager extends React.Component {
    @observable redirectToIndexPage = false;
    @observable initialValues = {
        title: '',
        firstName: '',
        lastName: '',
        position: '',
        phone: '',
        fax: ''
    };

    @action
    submit = (values) => {
        registerContractManager({ body: values }).then(
            (user) => {
                userAuthSetToStorage(user);
                this.redirectToIndexPage = true;
            }
        );
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
                                text: t('Manager Information')
                            }
                        ]}/>
                        <ActionSteps
                            items={[t('Log In Information'), t('Manager Information')]}
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
                                                    {t('Finish Registration')}
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
