import React from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

import { Loader } from 'simple';
import { copyToClipboard } from 'simple/logic';
import { CachedForm, FORM_NAMES, FieldText } from 'components/form';
import { registrationUserValidatorWithEmail } from 'components/form/validation';
import FormUserData from 'parts/form-user-data';
import SettingsHeader from './parts/settings-header';
import {
    invitationSend,
    invitationGenerate
} from 'providers/api';

import UI from 'stores/ui-store';
import View from 'stores/view-store';

@observer
class InvitationSendPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            success: false,
            form: null
        };
        this.submit = this.submit.bind(this);
        this.reset = this.reset.bind(this);
    }

    submit(body) {
        this.setState({ success: null });
        let route = body.send ? invitationSend : invitationGenerate;
        route({ body }).then(
            (data) => {
                UI.dropFormCache(FORM_NAMES.CreateInviteForm);
                this.setState({
                    success:
                        (body.send || !data) ?
                            true :
                            window.location.origin + '/signup/invite/' + body.email + '/' + data,
                    name: (body.firstName || body.lastName) ? (body.firstName + ' ' + body.lastName) : null
                });
            },
            (error) => {
                this.setState({ success: false });
                View.setTopAlertText(error?.title || error?.detail);
            }
        );
    }

    reset() {
        this.setState({ success: false });
    }

    submitButtonClick(send, formik) {
        formik.setFieldValue('send', send);
        formik.handleSubmit();
    }

    render() {
        let { t } = useTranslation();

        return (
            <div className="settings block cabinet">
                <SettingsHeader/>
                <section>
                    <h2><span className="brand">{t('Invite a Manager')}</span></h2>
                    {this.state.success === null && <Loader/>}
                    {this.state.success && <div>
                        {this.state.success === true ?
                            <div>
                                {this.state.name ?
                                    <h3>{t('Your invitation sent to')} {this.state.name}</h3> :
                                    <h3>{t('Your invitation sent')}</h3>}
                                <br/>
                            </div> :
                            <div>
                                <div className="form">
                                    <h3>{t('Send this link as an invitation')}</h3>
                                    <br/>
                                    <FieldText
                                        value={this.state.success}
                                    />
                                </div>
                                <br/>
                                <button className="button small" onClick={() => copyToClipboard(this.state.success)}>
                                    {t('Copy to Clipboard')}
                                </button>
                            </div>}
                        <button className="button payment-back" onClick={this.reset}>
                            {t('Send one more invite')}
                        </button>
                    </div>}
                    {false === this.state.success &&
                        <p>
                            Invite someone to your Service Supplier so you will
                            be able to manage the same accommodations and contracts.
                            <br/>
                            <br/>
                        </p>
                    }

                    {false === this.state.success && <CachedForm
                        id={FORM_NAMES.CreateInviteForm}
                        initialValues={{
                            email: '',
                            title: '',
                            firstName: '',
                            lastName: '',
                            position: ''
                        }}
                        validationSchema={registrationUserValidatorWithEmail}
                        onSubmit={this.submit}
                        render={(formik) => (
                            <React.Fragment>
                                <div className="form">
                                    <div className="row">
                                        <FieldText formik={formik}
                                                   id="email"
                                                   label={t('Email')}
                                                   placeholder={t('Email')}
                                                   required
                                        />
                                    </div>
                                    <FormUserData formik={formik} t={t}/>
                                    <div className="row submit-holder">
                                        <div className="field">
                                            <div className="inner">
                                                <button onClick={() => this.submitButtonClick(true, formik)}
                                                        className={'button' + __class(!formik.isValid, 'disabled')}>
                                                    {t('Send Invitation')}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="field">
                                            <div className="inner">
                                                <button onClick={() => this.submitButtonClick(false, formik)}
                                                        className={'button' + __class(!formik.isValid, 'disabled')}>
                                                    {t('Generate Invitation Link')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                    />}
                </section>
            </div>
        );
    }
}

export default InvitationSendPage;