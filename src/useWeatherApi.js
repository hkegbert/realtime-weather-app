import { useState, useEffect, useCallback } from 'react';

const fetchWeatherForecast = (cityName) => {
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-AC4CD46C-FF12-47A9-ADC5-B05754A9D3CE&locationName=${cityName}`)
    .then((response) => response.json())
    .then((data) => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {}
        );
          
        /*
        console.log(weatherElements);
        setWeatherElement((prevState) => ({
          ... prevState ,
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        }));
        */
       const weatherForecastData =  {
            description: weatherElements.Wx.parameterName,
            weatherCode: weatherElements.Wx.parameterValue,
            rainPossibility: weatherElements.PoP.parameterName,
            comfortability: weatherElements.CI.parameterName,
        };

        return weatherForecastData;
    });
};

const fetchCurrentWeather = (locationName) => {
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-AC4CD46C-FF12-47A9-ADC5-B05754A9D3CE&locationName=${locationName}`)
    .then((response) => response.json())
    .then((data) => {
        const locationData = data.records.location[0];

        const weatherElements = locationData.weatherElement.reduce(
            (neededElements, item) => {
              if (['WDSD', 'TEMP', 'HUMD', 'Weather'].includes(item.elementName)) {
                neededElements[item.elementName] = item.elementValue;
              }
              return neededElements;
            },
            {}
          );

        const currentWeatherData = {
            observationTime: locationData.time.obsTime,
            locationName: locationData.locationName,
            temperature: weatherElements.TEMP,
            windSpeed: weatherElements.WDSD,
            humid: weatherElements.HUMD,
        };

        /*
        setWeatherElement((prevState) => ({
            ... prevState,
            ... currentWeatherData,
        }));
        */
       return currentWeatherData;
    });
}


const useWeatherApi = (currentLocation) => {
    const { locationName, cityName } = currentLocation;

    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        humid: 0,
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
        isLoading: true
    });

    const fetchData  = useCallback(() => {
        setWeatherElement(prevState => ({
            ...prevState,
            isLoading: true
        }));

        Promise.all([
            fetchCurrentWeather(locationName),
            fetchWeatherForecast(cityName)
        ]).then(res => {
            const [currentWeather, weatherForecast] = res;
            setWeatherElement({
                ...currentWeather,
                ...weatherForecast,
                isLoading: false
            });
        });
    }, [locationName, cityName]);

    useEffect(() => {
        console.log('execute function in useEffect');
        fetchData();
    }, [fetchData]);

    return [weatherElement, fetchData];
};

export default useWeatherApi;