import React, { useState } from 'react';

const MessageForm = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Add your logic for what happens when the form is submitted
    console.log('Message Submitted', { recipient, subject, body });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="recipient">Recipient(s):</label>
        <input
          type="email"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
          multiple
          placeholder="did:health:123458988fdjk"
        />
      </div>

      <div>
        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="body">Message Body:</label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>

      <button type="submit">Send Message</button>
    </form>
  );
};

export default MessageForm;
