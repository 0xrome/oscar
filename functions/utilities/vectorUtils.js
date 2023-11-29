export const attributesToVector = (userAttributes) => {
    let date = new Date(userAttributes.date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // Months are zero-based
    let day = date.getDate();
    // Assuming countries are ['USA', 'UK', 'Canada']
    let nationality = new Array(3).fill(0);
    nationality[userAttributes.nationalityIndex] = 1; // You need to find out the index based on user data
    return [
        year, month, day,
        ...nationality,
        userAttributes.height,
        userAttributes.introExtroScale,
        userAttributes.ambitionScale
    ];
};
export const preferencesToVector = (userPreferences) => {
    return [
        userPreferences.introExtroAttraction,
        userPreferences.heightImportance,
        userPreferences.ambitionImportance,
        // userPreferences.desiredAgeRangeStart,
        // userPreferences.desiredAgeRangeEnd
    ];
};
