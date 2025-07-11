import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function EventList({ locale }) {
    const { user, jwt } = useContext(UserContext);
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !jwt) {
            navigate('/login');
            return;
        }

        const fetchEvents = async () => {
            try {
                console.log('Fetching events for locale:', locale);
                const response = await axios.get(`http://localhost:1337/api/events?populate=*&locale=${locale}`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                console.log('Full API Response:', response);
                console.log('Data directly from response.data:', response.data);
                console.log('The actual events array (response.data.data):', response.data.data);
                setEvents(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching events:', err.response ? err.response.data : err.message);
                setError('Failed to load events.');
                setLoading(false);
            }
        };

        fetchEvents();
    }, [locale, user, jwt, navigate]);

    if (loading) {
        return <div>Loading events...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (events.length === 0) {
        console.log("Events array is empty. Displaying 'No events found.'");
        return <div>No events found.</div>;
    }

    console.log('Events array content (before map):', events);

    return (
        <div className="events-page-container">
            {user && (
                <Link to="/profile" className="profile-icon-link">
                    <div className="profile-icon">
                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                </Link>
            )}

            <h2>Upcoming Events</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {events.map(event => {
                    if (!event || typeof event.id === 'undefined' || typeof event.documentId === 'undefined') {
                        console.warn('Skipping malformed event with missing ID or documentId:', event);
                        return null;
                    }

                    const imageUrl = event.media && event.media.length > 0 && event.media[0]
                        ? `http://localhost:1337${event.media[0].url}`
                        : null;

                    return (
                        <div key={event.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                            <Link to={`/events/${event.documentId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <h3>{event.name}</h3>
                                <p>{event.description}</p>
                                <p><strong>Start:</strong> {new Date(event.start_time).toLocaleString()}</p>

                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt={event.name}
                                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                )}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default EventList;