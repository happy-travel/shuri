import React from 'react';
import propTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import authStore from 'matsumoto/src/stores/auth-store';

@observer
class UserMenu extends React.Component {
    render() {
        const { t } = this.props;
        const userName = (authStore.user?.firstName || '') + ' ' + (authStore.user?.lastName || '');

        return (
            <>
                <Link to="/logout" className="button transparent-with-border">
                    {t('Log out')}
                </Link>
                <div className="switcher user-switcher shuri-user-menu">
                    <div className="avatar" />
                    <div className="double">
                        <div
                            className="name"
                            {...calcTitleFor(userName)}
                        >
                            <span>
                                {userName}
                            </span>
                        </div>
                        <div
                            className="company"
                            {...calcTitleFor(authStore.activeCounterparty.name)}
                        >
                            {authStore.activeCounterparty.name}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

function calcTitleFor(value) {
    return value?.length > 14 ? { title: value } : {};
}

UserMenu.propTypes = {
    t: propTypes.func
};

export default withTranslation()(UserMenu);
