import React from 'react';
import { observer } from 'mobx-react';
import {
    CachedForm,
    FieldText,
    FieldSelect,
    FieldSwitch
} from "components/form";
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';

import View from 'stores/view-store';

@observer
class ContractPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contract: {}
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        //todo: get contract by route :id -> this.state.contract
    }

    submit(values) {
        //todo: contract loaded by id useses another method
        API.post({
            url: apiMethods.contracts(),
            body: {
                "accommodationId": 2147483647,
                "validFrom": "2020-08-01T18:15:17.153Z",
                "validTo": "2020-08-30T18:15:17.153Z",
                "name": values.name,
                "description": "string"
            },
            success: (result) => {
                View.setTopAlertText(JSON.stringify(result));
            }
        })
    }

    render() {
        return (
            <div className="settings block">
                <section>
                    <h2><span class="brand">Create new contract</span></h2>

                    <CachedForm
                        initialValues={this.state.contract}
                        onSubmit={this.submit}
                        render={formik => (
                            <div class="form app-settings">
                                <div class="row">
                                    <FieldText formik={formik}
                                               id="name"
                                               placeholder="Enter name"
                                               clearable
                                    />
                                </div>
                                <div class="row controls">
                                    <div class="field">
                                        <div class="inner">
                                            <button type="submit" class="button"> {/*__class(!formik.isValid || !formik.dirty, "disabled")}>*/}
                                                Create
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </section>
            </div>
        );
    }
}

export default ContractPage;
