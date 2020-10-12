import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import { computed } from 'mobx';

class Menu extends React.Component {
    @computed
    get menuItems() {
        const { t, match: { params } } = this.props;
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
                submenu: [
                    {
                        name: t('Create new'),
                        activePath: '/accommodation',
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
                        link: `/accommodation/${params.accommodationId || params.id}`,
                        icon: 'profile'
                    },
                    {
                        name: t('Room types'),
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
                        link: `/accommodation/${params.accommodationId || params.id}/rooms`,
                        icon: 'rooms',
                        submenu: [
                            {
                                name: t('Create new'),
                                activePath: '/accommodation/:accommodationId/room',
                                link: `/accommodation/${params.accommodationId}/room`,
                                icon: 'plus'
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
                submenu: [
                    {
                        name: t('Create new'),
                        activePath: '/contract',
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
                        link: `/contract/${params.contractId || params.id}`,
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
                        link: `/contract/${params.contractId || params.id}/availability/rooms`,
                        icon: 'calendar',
                        submenu: [
                            {
                                name: `${t('Room')} #${params.roomId}`,
                                activePath: '/contract/:contractId/availability/room/:roomId/calendar',
                                shownPaths: [
                                    '/contract/:contractId/availability/room/:roomId/calendar'
                                ],
                                link: `/contract/${params.contractId || params.id}` +
                                    `/availability/${params.roomId}/calendar`
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
                        link: `/contract/${params.contractId || params.id}/rates`,
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
                        link: `/contract/${params.contractId || params.id}/seasons`,
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

        if (!isShown) {
            return null;
        }

        const isActive = item.activePath === path;
        const isExpanded = item.expandedPaths?.includes(path) && Boolean(item.submenu);
        return (
            <>
                <Link to={item.link} className="default-pointer">
                    <div className={'menu-item' + __class(isActive, 'active')}>
                        {item.icon ?
                            <span className={`menu-icon ${item.icon}` + __class(isActive, 'active')} /> :
                            null
                        }
                        <span className="menu-item-text">{item.name}</span>
                    </div>
                </Link>
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
