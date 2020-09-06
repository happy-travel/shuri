import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from 'matsumoto/src/components/external/table';
import { dateFormat, Loader } from 'matsumoto/src/simple';
import { getContracts } from 'providers/api';

const PAGE_SIZE = 10;

@observer
class ContractsList extends React.Component {
    @observable contractsList;
    @observable tablePageIndex = 0;
    tableColumns;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.tableColumns = [
            {
                Header: t('Name'),
                accessor: 'name'
            },
            {
                Header: t('Valid from'),
                accessor: 'validFrom',
                Cell: (item) => dateFormat.b(item.cell.value)
            },
            {
                Header: t('Valid to'),
                accessor: 'validTo',
                Cell: (item) => dateFormat.b(item.cell.value)
            },
            {
                Header: t('Id'),
                accessor: 'id',
                Cell: (item) => (
                    <Link to={`/contract/${item.cell.value}`}>
                        <span className="icon icon-action-pen-orange"/>
                    </Link>
                )
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

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    renderContent = () => {
        if (this.contractsList === undefined) {
            return <Loader />;
        }
        const tableData = this.contractsList.slice(
            PAGE_SIZE * this.tablePageIndex,
            PAGE_SIZE * (this.tablePageIndex + 1)
        );

        return this.contractsList.length ?
            <Table
                data={tableData}
                count={this.contractsList.length}
                fetchData={this.onPaginationClick}
                columns={this.tableColumns}
                pageIndex={this.tablePageIndex}
                pageSize={PAGE_SIZE}
                manualPagination
            /> :
            this.props.t('No results');
    }

    render() {
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
