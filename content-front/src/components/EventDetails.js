import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function EventDetails({ locale }) {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) {
                setLoading(false);
                setError('No event ID provided.');
                return;
            }
            try {
                const response = await axios.get(`http://localhost:1337/api/events/${id}?populate=*&locale=${locale}`);
                setEvent(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching event ${id}:`, err.response ? err.response.data : err.message);
                setError('Failed to load event details. Event might not exist or there was a server error.');
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id, locale]);

    if (loading) return <div>Loading event details...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!event) return <div>Event not found.</div>;

    const locationName = event.locations && event.locations.length > 0 && event.locations[0]
        ? event.locations[0].name
        : 'Not specified';

    const organizerName = event.organizers && event.organizers.length > 0 && event.organizers[0]
        ? event.organizers[0].name
        : 'Not specified';

    const imageUrl = event.media && event.media.length > 0 && event.media[0]
        ? `http://localhost:1337${event.media[0].url}`
        : null;

    return (
        <div>
            <h2>{event.name}</h2>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={event.name}
                    style={{ maxWidth: '400px', height: 'auto', marginBottom: '20px' }}
                />
            )}
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Starts:</strong> {new Date(event.start_time).toLocaleString()}</p>
            <p><strong>Ends:</strong> {new Date(event.end_time).toLocaleString()}</p>
            <p><strong>Location:</strong> {locationName}</p>
            <p><strong>Organizer:</strong> {organizerName}</p>
            <p><strong>Max Capacity:</strong> {event.max_cap}</p>
            <p>
                <strong>Website:</strong>{' '}
                {event.website ? (
                    <a href={event.website} target="_blank" rel="noopener noreferrer">
                        {event.website}
                    </a>
                ) : (
                    'N/A'
                )}
            </p>
        </div>
    );
}

export default EventDetails;