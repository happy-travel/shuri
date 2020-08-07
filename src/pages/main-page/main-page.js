import React from 'react';
import propTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class MainPage extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <div className="settings block">
                <section>
                    <h2>
                        <span className="brand">{t('main-page-title')}</span>
                    </h2>
                </section>
            </div>
        );
    }
}

MainPage.propTypes = {
    t: propTypes.func
};

export default withTranslation()(MainPage);
