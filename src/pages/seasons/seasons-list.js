import React from 'react';
import { withTranslation } from 'react-i18next';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import { Loader } from 'matsumoto/src/simple';
import { getSeasons } from 'providers/api';

@observer
class SeasonsList extends React.Component {
    @observable seasonsList;
    contractId;

    constructor(props) {
        super(props);
        this.contractId = this.props.match.params.id;
    }

    componentDidMount() {
        this.loadSeasons();
    }

    loadSeasons = () => {
        getSeasons({
            urlParams: {
                id: this.contractId
            }
        }).then(this.getSeasonsSuccess);
    }

    @action
    getSeasonsSuccess = (list) => {
        this.seasonsList = list;
    }

    renderContent = () => {
        if (this.seasonsList === undefined) {
            return <Loader />;
        }

        return this.seasonsList.length ?
            // To be updated.
            `There are ${this.seasonsList.length} seasons for given contract` :
            'No results';
    }

    render() {
        const { t } = this.props;
        return (
            <div className="settings block">
                <section>
                    <Breadcrumbs
                        backLink={`/contract/${this.contractId}`}
                        items={[
                            {
                                text: t('Contracts list'),
                                link: '/contracts'
                            },
                            {
                                text: `Contract #${this.contractId}`,
                                link: `/contract/${this.contractId}`
                            }, {
                                text: t('Seasons')
                            }
                        ]}
                    />
                    <h2>
                        <span className="brand">
                            {`Seasons for contract #${this.contractId}`}
                        </span>
                    </h2>
                    {this.renderContent()}
                </section>
            </div>
        );
    }
}

SeasonsList.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(SeasonsList);
