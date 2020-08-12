import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { API } from 'matsumoto/src/core';
import Table from 'matsumoto/src/components/external/table';
import {dateFormat, Loader} from 'matsumoto/src/simple';
import apiMethods from 'core/methods';

const PAGE_SIZE = 10;

@observer
class ContractsList extends React.Component {
    @observable contractsList = [];
    @observable tablePageIndex = 0;
    tableColumns;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.tableColumns = [
            /* {
                Header: t('contract-id'),
                accessor: 'id',
            },
            {
                Header: t('accommodation-id'),
                accessor: 'accommodationId',
            }, */
            {
                Header: t('name'),
                accessor: 'name',
            },
            {
                Header: t('valid-from'),
                accessor: 'validFrom',
                Cell: (item) => dateFormat.b(item.cell.value)
            },
            {
                Header: t('valid-to'),
                accessor: 'validTo',
                Cell: (item) => dateFormat.b(item.cell.value)
            },
            {
                Header: 'Id',
                accessor: 'id',
                Cell: (item) => {
                    return <Link
                        to={`/contract/${item.cell.value}`}
                    ><span className='icon icon-action-pen-orange'/></Link>;
                }
            },
        ];

    }

    componentDidMount() {
        this.loadContracts();
    }

    loadContracts = () => {
        API.get({
            url: apiMethods.contractsList(),
            success: this.loadContractsSuccess
        });
    }

    @action
    loadContractsSuccess = (list) => {
        this.contractsList = list;
    }

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    render() {
        const { t } = this.props;
        return (
            <div className="settings block">
                <section>
                    <div className="add-new-button-holder">
                        <Link to="/contract">
                            <button className="button small">
                                {t('add-contract')}
                            </button>
                        </Link>
                    </div>
                    <h2>
                        <span className="brand">
                            {t('contracts-page-title')}
                        </span>
                    </h2>
                    { this.contractsList === null ? <Loader /> :
                    ( this.contractsList?.length ?
                    <Table
                        data={this.contractsList.slice(PAGE_SIZE * this.tablePageIndex, PAGE_SIZE * (this.tablePageIndex + 1))}
                        count={this.contractsList.length}
                        fetchData={this.onPaginationClick}
                        columns={this.tableColumns}
                        pageIndex={this.tablePageIndex}
                        pageSize={PAGE_SIZE}
                        manualPagination
                    /> : "No results" )}
                </section>
            </div>
        );
    }
}

ContractsList.propTypes = {
    t: propTypes.func
};

export default withTranslation()(ContractsList);