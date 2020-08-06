import React from 'react';
import { observer } from 'mobx-react';
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';

@observer
class ContractsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null
        }
    }

    componentDidMount() {
       /* API.get({
            url: apiMethods.getCounterparties,
            success: (result) => {
                this.setState({
                    result
                });
            }
        }); */
    }

    render() {
        return (
            <div className="block">
                <section>
                    <h1>LIST</h1>
                    {this.state.result?.map((item) => null)}
                </section>
            </div>
        );
    }
}

export default ContractsList;
