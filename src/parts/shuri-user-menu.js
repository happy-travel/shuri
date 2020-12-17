import React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import authStore from 'matsumoto/src/stores/auth-store';

@observer
class UserMenu extends React.Component {
    render() {
        const userName = (authStore.user?.firstName || '') + ' ' + (authStore.user?.lastName || '');

        return (
            <>
                <Link to="/settings" class="switcher user-switcher">
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
                            {...calcTitleFor(authStore.counterpartyInfo?.name)}
                        >
                            {authStore.counterpartyInfo?.name}
                        </div>
                    </div>
                </Link>
            </>
        );
    }
}

function calcTitleFor(value) {
    return value?.length > 14 ? { title: value } : {};
}

export default UserMenu;
