import React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { API } from 'matsumoto/src/core';
import Table from "components/external/table";
import { dateFormat, Loader } from "simple";
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
    /*{
        Header: 'Description',
        accessor: 'description',
    },*/
];

@observer
class ContractsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }

    componentDidMount() {
        API.get({
            url: apiMethods.contracts(),
            success: (result) => {
                this.setState({
                    list: result
                });
            }
        });
    }

    render() {
        return (
            <div className="settings block">
                <section>
                    <div class="add-new-button-holder">
                        <Link to="/contract">
                            <button class="button small">
                                Add new contract
                            </button>
                        </Link>
                    </div>

                    <h2><span class="brand"><span class="brand">Contracts list</span></span></h2>

                    <Table
                        data={this.state.list}
                        count={this.state.list?.length}
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

export default ContractsList;
