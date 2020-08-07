import React from 'react';
import { withTranslation } from 'react-i18next';
import {
    CachedForm,
    FieldText
} from 'matsumoto/src/components/form';
import { API } from 'matsumoto/src/core';
import viewStore from 'matsumoto/src/stores/view-store';
import apiMethods from 'core/methods';
import propTypes from 'prop-types';

class ContractPage extends React.Component {
    state = {
        contract: {}
    };

    componentDidMount() {
        //todo: get contract by route :id -> this.state.contract
    }

    createContract = (values) => {
        API.post({
            url: apiMethods.contractsList(),
            body: {
                accommodationId: 2147483647,
                validFrom: '2020-08-01T18:15:17.153Z',
                validTo: '2020-08-30T18:15:17.153Z',
                name: values.name,
                description: 'string'
            },
            success: (result) => {
                viewStore.setTopAlertText(JSON.stringify(result));
            }
        })
    }

    renderForm = (formik) => {
        const { t } = this.props;
        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldText
                        formik={formik}
                        id="name"
                        placeholder={t('enter-contract-name')}
                        clearable
                    />
                </div>
                <div className="row controls">
                    <div className="field">
                        <div className="inner">
                            <button type="submit" className="button">
                                {t('create-contract-button')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="settings block">
                <section>
                    <h2>
                        <span className="brand">
                            {this.props.t('create-contract-title')}
                        </span>
                    </h2>
                    <CachedForm
                        initialValues={this.state.contract}
                        onSubmit={this.createContract}
                        render={this.renderForm}
                    />
                </section>
            </div>
        );
    }
}

ContractPage.propTypes = {
    t: propTypes.func
};

export default withTranslation()(ContractPage);
