import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { API } from 'matsumoto/src/core';
import Table from 'matsumoto/src/components/external/table';
import { dateFormat } from 'matsumoto/src/simple';
import apiMethods from 'core/methods';

const TABLE_COLUMNS = [
    {
        Header: 'Contract Id',
        accessor: 'id',
    },
    {
        Header: 'Accommodation Id',
        accessor: 'accommodationId',
    },
    {
        Header: 'Name',
        accessor: 'name',
    },
    {
        Header: 'Valid From',
        accessor: 'validFrom',
        Cell: (item) => dateFormat.b(item.cell.value)
    },
    {
        Header: 'Valid To',
        accessor: 'validTo',
        Cell: (item) => dateFormat.b(item.cell.value)
    }
];

const PAGE_SIZE = 5;

class ContractsList extends React.Component {
    state = {
        list: [],
        pageIndex: 0
    }

    componentDidMount() {
        API.get({
            url: apiMethods.contractsList(),
            success: (list) => {
                this.setState({
                    list: list
                });
            }
        });
    }

    onPaginationClick = ({ pageIndex }) => {
        this.setState({ pageIndex });
    }

    render() {
        const { t } = this.props;
        const { list, pageIndex } = this.state;
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
                    <Table
                        data={list.slice(PAGE_SIZE * pageIndex, PAGE_SIZE * (pageIndex + 1))}
                        count={list.length}
                        fetchData={this.onPaginationClick}
                        columns={TABLE_COLUMNS}
                        pageIndex={pageIndex}
                        pageSize={PAGE_SIZE}
                        manualPagination
                    />
                </section>
            </div>
        );
    }
}

ContractsList.propTypes = {
    t: propTypes.func
};

export default withTranslation()(ContractsList);
