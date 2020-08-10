import React from 'react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import UserMenu from 'matsumoto/src/components/complex/user-menu';
import { withTranslation } from 'react-i18next';

class Header extends React.Component {
    get isOnAccommodationsPage() {
        return this.props.location.pathname === '/accommodations';
    }

    get isOnContractsPage() {
        return this.props.location.pathname === '/contracts';
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
                                to="/accommodations"
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
