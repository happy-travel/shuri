import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { API } from 'matsumoto/src/core';
import Breadcrumbs from 'components/breadcrumbs';
import Table from 'matsumoto/src/components/external/table';
import apiMethods from 'core/methods';
import UIStore from 'stores/shuri-ui-store';
import { Link } from 'react-router-dom';
import { Loader } from 'matsumoto/src/simple';

const PAGE_SIZE = 10;

@observer
class RoomsList extends React.Component {
    @observable roomsList = null;
    @observable tablePageIndex = 0;
    @observable tableColumns;

    constructor(props) {
        super(props);
        const { t } = this.props;
        this.state = {
            accommodationId: this.props.match.params.accommodationId
        };

        this.tableColumns = [
            {
                Header: "Room Id",
                accessor: 'id',
            },
            {
                Header: t('name'),
                accessor: 'name',
                Cell: (item) => item.cell.value[UIStore.editorLanguage]
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: (item) => {
                    return <Link
                        to={`/accommodation/${this.state.accommodationId}/room/${item.cell.value}`}
                    ><span className='icon icon-action-pen-orange'/></Link>;
                }
            },
        ];
    }

    componentDidMount() {
        API.get({
            url: apiMethods.roomsList(this.state.accommodationId),
            success: list => this.roomsList = list
        });
    }

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    render() {
        const {
            accommodationId
        } = this.state;

        return (
            <div className="settings block">
                <section>
                    <Breadcrumbs
                        backLink={`/accommodation/${accommodationId}`}
                        items={[
                            {
                                text: 'Accommodations list',
                                link: '/'
                            }, {
                                text: 'Accommodation',
                                link: `/accommodation/${accommodationId}`
                            }, {
                                text: 'Rooms list'
                            }
                        ]}
                    />
                    <h2>
                        <div className="add-new-button-holder">
                            <Link to={`/accommodation/${this.state.accommodationId}/room`}>
                                <button className="button small">
                                    Add new room
                                </button>
                            </Link>
                        </div>
                        <span className="brand">
                            Rooms list In Accommodation #{this.state.accommodationId}
                        </span>
                    </h2>
                    { this.roomsList === null ? <Loader /> :
                        ( this.roomsList?.length ?
                            <Table
                                data={this.roomsList.slice(PAGE_SIZE * this.tablePageIndex, PAGE_SIZE * (this.tablePageIndex + 1))}
                                count={this.roomsList.length}
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

export default withTranslation()(RoomsList);
