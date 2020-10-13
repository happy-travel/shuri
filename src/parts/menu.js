import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import EntitiesStore from 'stores/shuri-entities-store';
import UI from 'stores/shuri-ui-store';

@observer
class Menu extends React.Component {
    @computed
    get menuItems() {
        const { t, match: { params } } = this.props;
        const accommodationId = params.accommodationId || params.id;
        const contractId = params.contractId || params.id;
        return [
            {
                name: t('Accommodations'),
                activePath: '/',
                expandedPaths: [
                    '/',
                    '/accommodation',
                    '/accommodation/:id',
                    '/accommodation/:accommodationId/rooms',
                    '/accommodation/:accommodationId/room',
                    '/accommodation/:accommodationId/room/:id'
                ],
                link: '/',
                icon: 'accommodations',
                info: EntitiesStore.hasAccommodation(accommodationId) ?
                    {
                        main: EntitiesStore.getAccommodation(accommodationId).name[UI.editorLanguage],
                        details: EntitiesStore.getAccommodation(accommodationId).address[UI.editorLanguage],
                        shownPaths: [
                            '/accommodation/:id',
                            '/accommodation/:accommodationId/rooms',
                            '/accommodation/:accommodationId/room',
                            '/accommodation/:accommodationId/room/:id'
                        ]
                    } :
                    null,
                submenu: [
                    {
                        name: t('Create new'),
                        activePath: '/accommodation',
                        shownPaths: [
                            '/',
                            '/accommodation'
                        ],
                        link: '/accommodation',
                        icon: 'plus'
                    },
                    {
                        name: t('Profile'),
                        activePath: '/accommodation/:id',
                        shownPaths: [
                            '/accommodation/:id',
                            '/accommodation/:accommodationId/rooms',
                            '/accommodation/:accommodationId/room',
                            '/accommodation/:accommodationId/room/:id'
                        ],
                        link: `/accommodation/${accommodationId}`,
                        icon: 'profile'
                    },
                    {
                        name: t('Rooms'),
                        activePath: '/accommodation/:accommodationId/rooms',
                        expandedPaths: [
                            '/accommodation/:accommodationId/rooms',
                            '/accommodation/:accommodationId/room',
                            '/accommodation/:accommodationId/room/:id'
                        ],
                        shownPaths: [
                            '/accommodation/:id',
                            '/accommodation/:accommodationId/rooms',
                            '/accommodation/:accommodationId/room',
                            '/accommodation/:accommodationId/room/:id'
                        ],
                        link: `/accommodation/${accommodationId}/rooms`,
                        icon: 'rooms',
                        submenu: [
                            {
                                name: t('Create new'),
                                activePath: '/accommodation/:accommodationId/room',
                                shownPaths: [
                                    '/accommodation/:accommodationId/rooms',
                                    '/accommodation/:accommodationId/room'
                                ],
                                link: `/accommodation/${accommodationId}/room`,
                                icon: 'plus'
                            },
                            {
                                name: `${t('Room')} #${params.id}`,
                                activePath: '/accommodation/:accommodationId/room/:id',
                                shownPaths: [
                                    '/accommodation/:accommodationId/room/:id'
                                ],
                                link: `/accommodation/${accommodationId}/room/${params.id}`
                            }
                        ]
                    }
                ]
            },
            {
                name: t('Contracts'),
                activePath: '/contracts',
                expandedPaths: [
                    '/contracts',
                    '/contract',
                    '/contract/:id',
                    '/contract/:id/seasons',
                    '/contract/:id/rates',
                    '/contract/:contractId/availability/room/:roomId/calendar',
                    '/contract/:contractId/availability/rooms'
                ],
                link: '/contracts',
                icon: 'contracts',
                hasTopBorder: true,
                info: EntitiesStore.hasContract(contractId) ?
                    {
                        main: EntitiesStore.getContract(contractId).name,
                        details: EntitiesStore.getContract(contractId).description,
                        shownPaths: [
                            '/contract/:id',
                            '/contract/:id/seasons',
                            '/contract/:id/rates',
                            '/contract/:contractId/availability/room/:roomId/calendar',
                            '/contract/:contractId/availability/rooms'
                        ]
                    } :
                    null,
                submenu: [
                    {
                        name: t('Create new'),
                        activePath: '/contract',
                        shownPaths: [
                            '/contracts',
                            '/contract'
                        ],
                        link: '/contract',
                        icon: 'plus'
                    },
                    {
                        name: t('Profile'),
                        activePath: '/contract/:id',
                        shownPaths: [
                            '/contract/:id',
                            '/contract/:id/seasons',
                            '/contract/:id/rates',
                            '/contract/:contractId/availability/room/:roomId/calendar',
                            '/contract/:contractId/availability/rooms'
                        ],
                        link: `/contract/${contractId}`,
                        icon: 'profile'
                    },
                    {
                        name: t('Availability calendar'),
                        activePath: '/contract/:contractId/availability/rooms',
                        shownPaths: [
                            '/contract/:id',
                            '/contract/:id/seasons',
                            '/contract/:id/rates',
                            '/contract/:contractId/availability/room/:roomId/calendar',
                            '/contract/:contractId/availability/rooms'
                        ],
                        expandedPaths: [
                            '/contract/:contractId/availability/room/:roomId/calendar'
                        ],
                        link: `/contract/${contractId}/availability/rooms`,
                        icon: 'calendar',
                        submenu: [
                            {
                                name: `${t('Room')} #${params.roomId}`,
                                activePath: '/contract/:contractId/availability/room/:roomId/calendar',
                                shownPaths: [
                                    '/contract/:contractId/availability/room/:roomId/calendar'
                                ],
                                link: `/contract/${contractId}` +
                                    `/availability/room/${params.roomId}/calendar`
                            }
                        ]
                    },
                    {
                        name: t('Rates'),
                        activePath: '/contract/:id/rates',
                        shownPaths: [
                            '/contract/:id',
                            '/contract/:id/seasons',
                            '/contract/:id/rates',
                            '/contract/:contractId/availability/room/:roomId/calendar',
                            '/contract/:contractId/availability/rooms'
                        ],
                        link: `/contract/${contractId}/rates`,
                        icon: 'rates'
                    },
                    {
                        name: t('Seasons'),
                        activePath: '/contract/:id/seasons',
                        shownPaths: [
                            '/contract/:id',
                            '/contract/:id/seasons',
                            '/contract/:id/rates',
                            '/contract/:contractId/availability/room/:roomId/calendar',
                            '/contract/:contractId/availability/rooms'
                        ],
                        link: `/contract/${contractId}/seasons`,
                        icon: 'seasons'
                    }
                ]
            }
        ];
    }

    renderSubmenu = (submenu) => {
        return (
            <div className="submenu">
                {submenu.map(this.renderMenuItem)}
            </div>
        )
    }

    renderMenuItem = (item) => {
        const { path } = this.props.match;
        const isShown = !item.shownPaths || item.shownPaths.includes(path);
        const isInfoShown = item.info && (!item.info.shownPaths || item.info.shownPaths.includes(path));

        if (!isShown) {
            return null;
        }

        const isActive = item.activePath === path;
        const isExpanded = item.expandedPaths?.includes(path) && Boolean(item.submenu);
        const itemClassName = 'menu-item' + __class(isActive, 'active') + __class(item.hasTopBorder, 'with-top-border');
        return (
            <>
                <Link to={item.link} className="default-pointer">
                    <div className={itemClassName}>
                        {item.icon ?
                            <span className={`menu-icon ${item.icon}` + __class(isActive, 'active')} /> :
                            null
                        }
                        <span className="menu-item-text">{item.name}</span>
                    </div>
                </Link>
                {isInfoShown ?
                    <div className="info-item">
                        <span className="info-text">{item.info.main}</span>
                        {item.info.details ?
                            <span className="info-text info-details">{item.info.details}</span> :
                            null
                        }
                    </div> :
                    null
                }
                {isExpanded ? this.renderSubmenu(item.submenu) : null}
            </>
        );
    }

    render() {
        return (
            <nav className="menu">
                {this.menuItems.map(this.renderMenuItem)}
            </nav>
        );
    }
}

Menu.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(Menu);
