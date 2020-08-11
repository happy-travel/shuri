import React from 'react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import UserMenu from 'matsumoto/src/components/complex/user-menu';
import { withTranslation } from 'react-i18next';

class Header extends React.Component {
    get isOnAccommodationsPage() {
        return this.props.location.pathname === '/';
    }

    get isOnContractsPage() {
        return this.props.location.pathname === '/contracts';
    }

    get isOnRoomsPage() {
        return this.props.location.pathname === '/rooms';
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
                                {t('header-accommodations-link')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={this.isOnContractsPage ? 'selected' : ''}
                                to="/contracts"
                            >
                                {t('header-contracts-link')}
                            </Link>
                        </li>
                        { /* <li>
                            <Link
                                className={this.isOnRoomsPage ? 'selected' : ''}
                                to="/rooms"
                            >
                                {t('Rooms')}
                            </Link>
                        </li> */ }
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
