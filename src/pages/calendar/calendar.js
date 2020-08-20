import React from 'react';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';

@observer
class Calendar extends React.Component {
    contractId;

    constructor(props) {
        super(props);
        this.contractId = this.props.match.params.id;
    }

    renderContent = () => {
        return 'This is a calendar page.'
    }

    render() {
        const { t } = this.props;
        return (
            <div className="settings block">
                <section>
                    <Breadcrumbs
                        backLink={`/contract/${this.contractId}/seasons`}
                        items={[
                            {
                                text: t('Contracts list'),
                                link: '/contracts'
                            },
                            {
                                text: `Contract #${this.contractId}`,
                                link: `/contract/${this.contractId}`
                            },
                            {
                                text: t('Calendar')
                            }
                        ]}
                    />
                    <h2>
                        <span className="brand">
                            {`Calendar for contract #${this.contractId}`}
                        </span>
                    </h2>
                    {this.renderContent()}
                </section>
            </div>
        );
    }
}

Calendar.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(Calendar);
