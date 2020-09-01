import React from 'react';
import { action, observable } from 'mobx';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import { Loader } from 'matsumoto/src/simple';
import { getContract } from 'providers/api';

@observer
class Calendar extends React.Component {
    @observable contract;
    contractId = this.props.match.params.id;

    componentDidMount() {
        const requestParams = {
            urlParams: {
                id: this.contractId
            }
        };
        getContract(requestParams).then(this.getContractSuccess);
    }

    @action
    getContractSuccess = (contract) => {
        this.contract = contract;
    }

    renderBreadcrumbs = () => {
        const { t } = this.props;
        return (
            <Breadcrumbs
                backLink={`/contract/${this.contractId}/seasons`}
                items={[
                    {
                        text: t('Contracts'),
                        link: '/contracts'
                    },
                    {
                        text: this.contract.name || `Contract #${this.contractId}`,
                        link: `/contract/${this.contractId}`
                    },
                    {
                        text: t('Calendar')
                    }
                ]}
            />
        );
    }

    renderContent = () => {
        // TODO: HIR-48
        return 'This is a calendar page.'
    }

    render() {
        if (this.contract === undefined) {
            return <Loader />;
        }
        return (
            <div className="settings block">
                <section>
                    {this.renderBreadcrumbs()}
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
