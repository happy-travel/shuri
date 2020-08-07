import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { API } from 'matsumoto/src/core';
import Table from 'matsumoto/src/components/external/table';
import { dateFormat } from 'matsumoto/src/simple';
import apiMethods from 'core/methods';

const columns = [
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
    },
    {
        Header: 'Description',
        accessor: 'description',
    },
];

class AccommodationsList extends React.Component {
    state = {
        accommodationsList: []
    }

    componentDidMount() {
        API.get({
            url: apiMethods.accommodationsList(),
            success: (list) => {
                this.setState({
                    accommodationsList: list
                });
            }
        });
    }

    render() {
        return (
            <div className="settings block">
                <section>
                    <h2>
                        <span className="brand">
                            {this.props.t('accommodations-page-title')}
                        </span>
                    </h2>
                    <Table
                        data={this.state.accommodationsList}
                        count={this.state.accommodationsList.length}
                        fetchData={()=>{}}
                        columns={columns}
                        pageIndex={0}
                        pageSize={10}
                        manualPagination
                    />
                </section>
            </div>
        );
    }
}

AccommodationsList.propTypes = {
    t: propTypes.func
};

export default withTranslation()(AccommodationsList);
