import React from 'react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import UserMenu from 'parts/shuri-user-menu';
import { withTranslation } from 'react-i18next';

class Header extends React.Component {
    get isOnAccommodationsPage() {
        return (this.props.location.pathname.includes('/accommodation')) ||
               (this.props.location.pathname === '/');
    }

    get isOnContractsPage() {
        return this.props.location.pathname.includes('/contract');
    }

    render() {
        const { t } = this.props;
        return (
            <header>
                <section>
                    <div className="logo-wrapper">
                        <Link to="/" class="logo" />
                    </div>
                    <nav>
                        <li>
                            <Link
                                className={this.isOnAccommodationsPage ? 'selected' : ''}
                                to="/"
                            >
                                {t('Accommodations')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={this.isOnContractsPage ? 'selected' : ''}
                                to="/contracts"
                            >
                                {t('Contracts')}
                            </Link>
                        </li>
                    </nav>
                    <UserMenu />
                </section>
            </header>
        );
    }
}

Header.propTypes = {
    t: propTypes.func,
    location: propTypes.object
};

export default withTranslation()(Header);
