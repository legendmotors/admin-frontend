import React from 'react';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <div className='mb-4 bg-primary rounded-t-lg'>
      <div className="text-2xl font-bold uppercase px-4 py-3 text-white">{title}</div>
      <hr />
    </div>
  );
};

export default SectionHeader;
