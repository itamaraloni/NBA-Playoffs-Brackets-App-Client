import React from 'react';

const Team = ({ 
  name, 
  logo, 
  seed, 
  conference 
}) => {

  return (
    <div className="team-container flex items-center">
      {logo && (
        <img 
          src={logo} 
          alt={`${name} logo`} 
          className="team-logo w-12 h-12 mr-2"
          onError={(e) => {
            console.error(`Error loading logo for ${name}:`, e);
            e.target.style.display = 'none'; // Hide broken image
          }}
        />
      )}
      <div className="team-info">
        <div className="flex items-baseline">
          {seed && <span className='mr-1'>#{seed}</span>}
        <span className='team-name font-bold'>{name}</span>
        </div>
        <span className="team-conference text-sm italic text-gray-500">
          {conference}
        </span>
      </div>
    </div>
  );
};

export default Team;