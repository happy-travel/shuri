import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { FieldCheckbox } from 'matsumoto/src/components/form';
import FieldMultiRange from 'components/field-multi-range';

const MIN_AGE = 0;
const MAX_AGE = 25;

const range = (group, alwaysVisible) => {
    if (group?.enabled || alwaysVisible) {
        return ': ' + (group.lowerBound || 0) + '+';
    }
    return '';
};

const filterSelectedOnly = (arr = [], formik) => arr.filter((v, index) => [
    formik.values.occupancyDefinition.infant?.enabled,
    formik.values.occupancyDefinition.child?.enabled,
    formik.values.occupancyDefinition.teenager?.enabled,
    true
][index]);

@observer
class AgeRanges extends React.Component {
    //todo: it's a workaround.
    //todo: We need to fix fieldCheckbox to rerender after it's value changed silently
    //todo: Also detector of age category enabled needed
    @observable initialized;

    @action
    setIntialized = () => this.initialized = true;

    componentDidMount() {
        const { formik } = this.props;
        const keys = Object.keys(formik.values?.occupancyDefinition);
        if (!keys.length) {
            formik.setFieldValue('occupancyDefinition', {});
            return;
        }
        keys.forEach((key) => {
            if (formik.values?.occupancyDefinition[key] &&
                formik.values?.occupancyDefinition[key].enabled !== false) {
                formik.setFieldValue('occupancyDefinition.'+key+'.enabled', true);
            }
        });
        this.setIntialized();
    }

    render() {
        const { formik, t } = this.props;

        if (!this.initialized) {
            return null;
        }

        return (
            <div className="age-ranges">
                <h3>{t('Age groups presented')}</h3>

                <FieldCheckbox
                    formik={formik}
                    id={'occupancyDefinition.infant.enabled'}
                    label={
                        'Infant Age Group' + range(formik.values?.occupancyDefinition?.infant)
                    }
                />
                <FieldCheckbox
                    formik={formik}
                    id={'occupancyDefinition.child.enabled'}
                    label={
                        'Children Age Group' + range(formik.values?.occupancyDefinition?.child)
                    }
                />
                <FieldCheckbox
                    formik={formik}
                    id={'occupancyDefinition.teenager.enabled'}
                    label={
                        'Teenage Age Group' + range(formik.values?.occupancyDefinition?.teenager)
                    }
                />
                <div className="checkbox on">
                    {'Adult Age Group' + range(formik.values?.occupancyDefinition?.adult, true)}
                </div>

                <FieldMultiRange
                    formik={formik}
                    min={MIN_AGE}
                    max={MAX_AGE}
                    ids={filterSelectedOnly([
                        'occupancyDefinition.infant.lowerBound',
                        'occupancyDefinition.child.lowerBound',
                        'occupancyDefinition.teenager.lowerBound',
                        'occupancyDefinition.adult.lowerBound'
                    ], formik)}
                    colors={[
                        '#1267FB',
                        ...filterSelectedOnly([
                            '#1CBE69',
                            '#FF9D19',
                            '#ff9b71',
                            '#D8DADC'
                        ], formik)
                    ]}
                />
                <div className="line">
                    {new Array(MAX_AGE+1).fill(null).map((x, i) => (
                        <div key={i}>
                            {i}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

AgeRanges.propTypes = {
    t: propTypes.func,
    formik: propTypes.object
};

export default withTranslation()(AgeRanges);
