import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { API } from 'matsumoto/src/core';
import Table from 'matsumoto/src/components/external/table';
import apiMethods from 'core/methods';
import UIStore from 'stores/shuri-ui-store';
import { Link } from 'react-router-dom';
import { Loader } from 'matsumoto/src/simple';

const PAGE_SIZE = 10;

@observer
class AccommodationsList extends React.Component {
    @observable accommodationsList = null;
    @observable tablePageIndex = 0;
    @observable tableColumns;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.tableColumns = [
            {
                Header: t('accommodation-id'),
                accessor: 'id',
            },
            {
                Header: t('name'),
                accessor: 'name',
                Cell: (item) => item.cell.value[UIStore.editorLanguage]
            },
            {
                Header: 'Id',
                accessor: 'id',
                Cell: (item) => {
                    return <Link
                        to={`/accommodation/${item.cell.value}`}
                    ><span className='icon icon-action-pen-orange'/></Link>;
                }
            },
        ];
    }

    componentDidMount() {
        this.loadAccommodations();
    }

    loadAccommodations = () => {
        API.get({
            url: apiMethods.accommodationsList(),
            success: this.loadAccommodationsSuccess
        });
    }

    @action
    loadAccommodationsSuccess = (list) => {
        this.accommodationsList = list;
    }

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    render() {
        return (
            <div className="settings block">
                <section>
                    <div className="add-new-button-holder">
                        <Link to="/accommodation">
                            <button className="button small">
                                Add new accommodation
                            </button>
                        </Link>
                    </div>
                    <h2>
                        <span className="brand">
                            {this.props.t('accommodations-page-title')}
                        </span>
                    </h2>
                    { this.accommodationsList === null ? <Loader /> :
                    ( this.accommodationsList?.length ?
                    <Table
                        data={this.accommodationsList.slice(PAGE_SIZE * this.tablePageIndex, PAGE_SIZE * (this.tablePageIndex + 1))}
                        count={this.accommodationsList.length}
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

AccommodationsList.propTypes = {
    t: propTypes.func
};

export default withTranslation()(AccommodationsList);
