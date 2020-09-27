import React from 'react';
import { Redirect } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import Table from 'matsumoto/src/components/table';
import { Stars } from 'matsumoto/src/simple';
import UIStore from 'stores/shuri-ui-store';
import { Link } from 'react-router-dom';
import { getAccommodations } from 'providers/api';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

@observer
class AccommodationsList extends React.Component {
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
                header: t('Name'),
                cell: (item) => item.name[UIStore.editorLanguage]
            },
            {
                header: t('Address'),
                cell: (item) => item.address[UIStore.editorLanguage]
            },
            {
                header: t('Property type'),
                cell: (item) => capitalize(item.propertyType)
            },
            {
                header: t('Star Rating'),
                cell: (item) => Stars({
                    count: capitalize(item.rating)
                }) || t('Not Rated')
            }
            /* todo: {
                header: t('Status'),
                cell: 'status'
            }, */
        ];
    }

    componentDidMount() {
        getAccommodations().then(this.getAccommodationsSuccess);
    }

    @action
    getAccommodationsSuccess = (list) => {
        this.accommodationsList = list;
    }

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    renderContent = () => {
        return (
            <Table
                list={this.accommodationsList}
                columns={this.tableColumns}
                textEmptyResult={'No accommodations found'}
                textEmptyList={'No accommodations added'}
                onRowClick={(item) => this.redirect = `/accommodation/${item.id}`}
            />
        );
    }

    render() {
        if (this.redirect) {
            return <Redirect push to={this.redirect}/>;
        }

        const { t } = this.props;
        return (
            <div className="settings block">
                <section>
                    <div className="add-new-button-holder">
                        <Link to="/accommodation">
                            <button className="button small">
                                {t('Add new accommodation')}
                            </button>
                        </Link>
                    </div>
                    <h2>
                        <span className="brand">
                            {t('Accommodations List')}
                        </span>
                    </h2>
                    {this.renderContent()}
                </section>
            </div>
        );
    }
}

AccommodationsList.propTypes = {
    t: propTypes.func
};

export default withTranslation()(AccommodationsList);
