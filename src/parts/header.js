import React from 'react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import UserMenu from 'parts/shuri-user-menu';
import { withTranslation } from 'react-i18next';

const Header = (props) => {
    const { t } = props;
    return (
        <header>
            <section>
                <div className="logo-wrapper">
                    <Link to="/" class="logo" />
                </div>
                <nav>
                    <li>
                        <Link
                            className="selected"
                            to="/"
                        >
                            {t('Accommodation')}
                        </Link>
                    </li>
                </nav>
                <UserMenu />
            </section>
        </header>
    );
}

Header.propTypes = {
    t: propTypes.func,
    location: propTypes.object
};

export default withTranslation()(Header);
