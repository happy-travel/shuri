import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import Table from 'matsumoto/src/components/table';
import { dateFormat } from 'matsumoto/src/simple';
import { getContracts } from 'providers/api';

@observer
class ContractsList extends React.Component {
    @observable contractsList = null;
    @observable redirect;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.tableColumns = [
            {
                header: t('Id'),
                cell: 'id'
            },
            {
                header: t('Name'),
                cell: 'name'
            },
            {
                header: t('Valid from'),
                cell: (item) => dateFormat.b(item.validFrom)
            },
            {
                header: t('Valid to'),
                cell: (item) => dateFormat.b(item.validTo)
            }
        ];

    }

    componentDidMount() {
        getContracts().then(this.getContractsSuccess);
    }

    @action
    getContractsSuccess = (list) => {
        this.contractsList = list;
    }

    renderContent = () => {
        return (
            <Table
                list={this.contractsList}
                columns={this.tableColumns}
                textEmptyResult={'No contracts found'}
                textEmptyList={'No contracts added'}
                onRowClick={(item) => this.redirect = `/contract/${item.id}`}
            />
        );
    }

    render() {
        if (this.redirect) {
            return <Redirect push to={this.redirect}/>;
        }

        const { t } = this.props;
        return (
            <div className="settings block">
                <section>
                    <h2>
                        <div className="add-new-button-holder">
                            <Link to="/contract">
                                <button className="button small">
                                    {t('Add new contract')}
                                </button>
                            </Link>
                        </div>
                        <span className="brand">
                            {t('Contracts list')}
                        </span>
                    </h2>
                    {this.renderContent()}
                </section>
            </div>
        );
    }
}

ContractsList.propTypes = {
    t: propTypes.func
};

export default withTranslation()(ContractsList);
