import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import { useNavigate, Link } from 'react-router-dom';

function Profile() {
    const { user, jwt, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState('');
    const [phone, setPhone] = useState('');

    const [roleChoice, setRoleChoice] = useState('');

    const [cardId, setCardId] = useState(null);
    const [disabilityCardFile, setDisabilityCardFile] = useState(null);
    const [disabilityCardFileName, setDisabilityCardFileName] = useState('');
    const [issuingCard, setIssuingCard] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user || !jwt) {
            navigate('/login');
        } else {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setEmail(user.email || '');
            setBirthday(user.birthday || '');
            setPhone(user.phone || '');
            setRoleChoice(user.roleChoice || 'companion');

            if (user.roleChoice === 'disabledPerson') {
                fetchDisabilityCard();
            } else {
                setCardId(null);
                setDisabilityCardFile(null);
                setDisabilityCardFileName('');
                setIssuingCard('');
                setExpiryDate('');
            }
        }
    }, [user, jwt, navigate]);

    const fetchDisabilityCard = async () => {
        try {
            const response = await axios.get(`http://localhost:1337/api/users/me?populate=disability_card.file`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            const fetchedCard = response.data.disability_card;

            if (fetchedCard) {
                setCardId(fetchedCard.id);
                setIssuingCard(fetchedCard.issuing_card || '');
                setExpiryDate(fetchedCard.expiry ? fetchedCard.expiry.substring(0, 10) : '');
                setDisabilityCardFileName(fetchedCard.file ? fetchedCard.file.name : '');
            } else {
                setCardId(null);
                setDisabilityCardFile(null);
                setDisabilityCardFileName('');
                setIssuingCard('');
                setExpiryDate('');
            }
        } catch (error) {
            console.error('Error fetching disability card:', error.response ? error.response.data : error.message);
            setMessage('Error loading disability card details.');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSaving(true);

        try {
            await axios.put(`http://localhost:1337/api/users/${user.id}`, {
                roleChoice: roleChoice,
            }, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            let uploadedFileId = null;

            if (roleChoice === 'disabledPerson') {
                if (!disabilityCardFile && !disabilityCardFileName) {
                    setMessage('Please upload your disability card file.');
                    setIsSaving(false);
                    return;
                }
                if (!issuingCard || !expiryDate) {
                    setMessage('Please fill in all disability card details (Issuing Card Authority and Expiry Date).');
                    setIsSaving(false);
                    return;
                }

                if (disabilityCardFile) {
                    const formData = new FormData();
                    formData.append('files', disabilityCardFile);

                    const uploadResponse = await axios.post('http://localhost:1337/api/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${jwt}`,
                        },
                    });
                    uploadedFileId = uploadResponse.data[0].id;
                }

                const cardData = {
                    issuing_card: issuingCard,
                    expiry: expiryDate,
                    file: uploadedFileId || (disabilityCardFileName ? user.disability_card?.file?.id : null),
                };

                if (cardId) {
                    await axios.put(`http://localhost:1337/api/disability-cards/${cardId}`, { data: cardData }, {
                        headers: {
                            Authorization: `Bearer ${jwt}`,
                        },
                    });
                    setMessage('Profile and Disability Card updated successfully!');
                } else {
                    const createCardResponse = await axios.post('http://localhost:1337/api/disability-cards', { data: cardData }, {
                        headers: {
                            Authorization: `Bearer ${jwt}`,
                        },
                    });
                    setCardId(createCardResponse.data.data.id);
                    setMessage('Profile and Disability Card created successfully!');

                    await axios.put(`http://localhost:1337/api/users/${user.id}`, {
                        disability_card: createCardResponse.data.data.id
                    }, {
                        headers: { Authorization: `Bearer ${jwt}` }
                    });
                }
            } else {
                if (user.disability_card) {
                    await axios.put(`http://localhost:1337/api/users/${user.id}`, {
                        disability_card: null
                    }, {
                        headers: { Authorization: `Bearer ${jwt}` }
                    });
                    setMessage('Profile updated and disability card unlinked.');
                } else {
                    setMessage('Profile updated.');
                }
                setCardId(null);
                setDisabilityCardFile(null);
                setDisabilityCardFileName('');
                setIssuingCard('');
                setExpiryDate('');
            }

            const updatedUserResponse = await axios.get(`http://localhost:1337/api/users/me?populate=disability_card.file`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            setUser(updatedUserResponse.data);
            localStorage.setItem('user', JSON.stringify(updatedUserResponse.data));

        } catch (error) {
            console.error('Error saving profile:', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message
                ? error.response.data.error.message
                : 'Something went wrong saving your profile. Check console for details.';
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return <p>Please log in to view your profile.</p>;
    }

    return (
        <div className="card"> {/* Applied card style */}
            <h2>My Profile</h2>
            <form onSubmit={handleSaveProfile}>
                <h3>Personal Information</h3>
                <div className="form-group"> {/* Applied form-group */}
                    <label>First Name:</label>
                    <p>{firstName}</p> {/* Use p for display only field */}
                </div>
                <div className="form-group">
                    <label>Last Name:</label>
                    <p>{lastName}</p>
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <p>{email}</p>
                </div>
                <div className="form-group">
                    <label>Birthday:</label>
                    <p>{birthday}</p>
                </div>
                <div className="form-group">
                    <label>Phone:</label>
                    <p>{phone}</p>
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <p>{roleChoice === 'disabledPerson' ? 'Disabled Person' : 'Companion'}</p>
                </div>

                <hr style={{ margin: '30px 0' }} />

                <h3>Role Selection</h3>
                <div className="form-group radio-group"> {/* Applied form-group and radio-group */}
                    <label>I am a:</label>
                    <input
                        type="radio"
                        id="profile_role_companion"
                        name="profileRoleChoice"
                        value="companion"
                        checked={roleChoice === 'companion'}
                        onChange={(e) => setRoleChoice(e.target.value)}
                    />
                    <label htmlFor="profile_role_companion">Companion</label>
                    <input
                        type="radio"
                        id="profile_role_disabledPerson"
                        name="profileRoleChoice"
                        value="disabledPerson"
                        checked={roleChoice === 'disabledPerson'}
                        onChange={(e) => setRoleChoice(e.target.value)}
                    />
                    <label htmlFor="profile_role_disabledPerson">Disabled Person</label>
                </div>

                {roleChoice === 'disabledPerson' && (
                    <>
                        <hr style={{ margin: '30px 0' }} />
                        <h3>Disability Card Details</h3>
                        <div className="form-group">
                            <label htmlFor="disabilityCardFile">Upload New Disability Card File:</label>
                            <input type="file" id="disabilityCardFile" onChange={(e) => setDisabilityCardFile(e.target.files[0])} />
                            {disabilityCardFileName && <p style={{ fontSize: '0.9em', color: 'var(--color-text-light)' }}>Current file: {disabilityCardFileName}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="issuingCard">Issuing Card Authority:</label>
                            <input type="text" id="issuingCard" value={issuingCard} onChange={(e) => setIssuingCard(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="expiryDate">Expiry Date:</label>
                            <input type="date" id="expiryDate" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </div>
                    </>
                )}

                <button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
                {message && <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
            </form>

            {/* Back to Events Link */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/events" className="button secondary-button">
                    Back to Events
                </Link>
            </div>
        </div>
    );
}

export default Profile;