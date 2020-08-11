import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { API } from 'matsumoto/src/core';
import Table from 'matsumoto/src/components/external/table';
import { dateFormat } from 'matsumoto/src/simple';
import apiMethods from 'core/methods';

const PAGE_SIZE = 10;

@observer
class RoomsList extends React.Component {
    @observable roomsList = [];
    @observable tablePageIndex = 0;
    tableColumns;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.state = {
            accommodationId: this.props.match.params.accommodationId
        };

        this.tableColumns = [
            {
                Header: t('contract-id'),
                accessor: 'id',
            },
            {
                Header: t('accommodation-id'),
                accessor: 'accommodationId',
            },
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
            }
        ];

    }

    componentDidMount() {
        API.get({
            url: apiMethods.roomsList(this.state.accommodationId),
            success: (result) => this.roomsList = result
        });
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
                        <Link to={`/accommodations/${this.state.accommodationId}/room`}>
                            <button className="button small">
                                Add New Room
                            </button>
                        </Link>
                    </div>
                    <h2>
                        <span className="brand">
                            Rooms
                        </span>
                    </h2>
                    {/*<Table
                        data={this.roomsList.slice(PAGE_SIZE * this.tablePageIndex, PAGE_SIZE * (this.tablePageIndex + 1))}
                        count={this.roomsList.length}
                        fetchData={this.onPaginationClick}
                        columns={this.tableColumns}
                        pageIndex={this.tablePageIndex}
                        pageSize={PAGE_SIZE}
                        manualPagination
                    />*/ }
                    <pre>
                        {JSON.stringify(this.roomsList,1,2)}
                    </pre>
                </section>
            </div>
        );
    }
}

RoomsList.propTypes = {
    t: propTypes.func
};

export default withTranslation()(RoomsList);
