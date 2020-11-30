import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Table from 'matsumoto/src/components/table';
import { dateFormat } from 'matsumoto/src/simple';
import Menu from 'parts/menu';
import { getContracts, getAccommodations } from 'providers/api';
import UI from 'stores/shuri-ui-store';

@observer
class ContractsList extends React.Component {
    @observable contractsList = null;
    @observable accommodationsList = null;
    @observable redirect;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.tableColumns = [
            {
                header: t('Id'),
                cell: 'id'
            },
            {
                header: t('Accommodation'),
                cell: 'accommodationName'
            },
            {
                header: t('Contract'),
                cell: 'name'
            },
            {
                header: t('Valid from'),
                cell: (item) => dateFormat.b(item.validFrom)
            },
            {
                header: t('Valid to'),
                cell: (item) => dateFormat.b(item.validTo)
            }
        ];

    }

    componentDidMount() {
        Promise.all([
            getContracts(),
            getAccommodations()
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contractsList = [], accommodationsList]) => {
        contractsList.forEach((contract) => {
            contract.accommodationName = 'None';
            if (contract.accommodationId >= 0) {
                accommodationsList.forEach((accommodation) => {
                    if (contract.accommodationId === accommodation.id) {
                        contract.accommodationName = accommodation.name[UI.editorLanguage];
                    }
                })
            }
        });
        this.contractsList = contractsList;
    }

    renderContent = () => {
        return (
            <Table
                list={this.contractsList}
                columns={this.tableColumns}
                textEmptyResult={'No contracts found'}
                textEmptyList={'No contracts added'}
                onRowClick={(item) => this.redirect = item.accommodationName !== 'None' ? `/contract/${item.id}` : null}
            />
        );
    }

    render() {
        if (this.redirect) {
            return <Redirect push to={this.redirect}/>;
        }

        const { t } = this.props;
        return (
            <div className="settings block contracts">
                <Menu match={this.props.match}/>
                <section>
                    <h2>
                        <span className="brand">
                            {t('Contracts list')}
                        </span>
                    </h2>
                    {this.renderContent()}
                </section>
            </div>
        );
    }
}

ContractsList.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(ContractsList);
