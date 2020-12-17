import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import authStore from 'stores/auth-store';

@observer
class SettingsHeader extends React.Component {
    render() {
        const { t } = useTranslation();

        return (
            <div className="settings-header">
                <section>
                    <div className="logout-wrapper">
                        <Link to="/logout" class="button transparent-with-border">
                            <i className="icon icon-logout" />
                            {t('Log out')}
                        </Link>
                    </div>
                    <div className="user">
                        <div className="photo">
                            <div className="no-avatar" />
                        </div>
                        <div className="data">
                            <h1>{authStore.user?.firstName} {authStore.user?.lastName}</h1>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default SettingsHeader;