import { Country, State, City } from 'country-state-city';

// Get India's country code (ISO2)
const INDIA_COUNTRY_CODE = 'IN';

/**
 * Get all states in India
 * @returns {Array} Array of state objects with id and label
 */
export const getStatesList = () => {
  try {
    const states = State.getStatesOfCountry(INDIA_COUNTRY_CODE);
    return states.map(state => ({
      id: state.isoCode,
      label: state.name,
      value: state.isoCode
    })).sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

/**
 * Get cities by state ISO code
 * @param {string} stateCode - State ISO code (e.g., 'KA' for Karnataka)
 * @returns {Array} Array of city objects with id and label
 */
export const getCitiesByState = (stateCode) => {
  try {
    if (!stateCode) return [];
    
    const cities = City.getCitiesOfState(INDIA_COUNTRY_CODE, stateCode);
    return cities.map(city => ({
      id: city.name,
      label: city.name,
      value: city.name
    })).sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error fetching cities for state:', stateCode, error);
    return [];
  }
};

/**
 * Get state name by ISO code
 * @param {string} stateCode - State ISO code
 * @returns {string} State name
 */
export const getStateNameByCode = (stateCode) => {
  try {
    if (!stateCode) return '';
    
    const states = State.getStatesOfCountry(INDIA_COUNTRY_CODE);
    const state = states.find(s => s.isoCode === stateCode);
    return state ? state.name : stateCode;
  } catch (error) {
    console.error('Error getting state name:', error);
    return stateCode;
  }
};

/**
 * Get state code by name
 * @param {string} stateName - State name
 * @returns {string} State ISO code
 */
export const getStateCodeByName = (stateName) => {
  try {
    if (!stateName) return '';
    
    const states = State.getStatesOfCountry(INDIA_COUNTRY_CODE);
    const state = states.find(s => s.name === stateName);
    return state ? state.isoCode : stateName;
  } catch (error) {
    console.error('Error getting state code:', error);
    return stateName;
  }
};

/**
 * Validate if a city exists in the given state
 * @param {string} cityName - City name
 * @param {string} stateCode - State ISO code
 * @returns {boolean} True if city exists in state
 */
export const validateCityInState = (cityName, stateCode) => {
  try {
    if (!cityName || !stateCode) return false;
    
    const cities = getCitiesByState(stateCode);
    return cities.some(city => city.label.toLowerCase() === cityName.toLowerCase());
  } catch (error) {
    console.error('Error validating city:', error);
    return false;
  }
};
