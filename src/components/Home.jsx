import React from 'react';
import Sidebar from './Sidebar';
import Prompt from './Prompt';

const Home = () => {
  return (
    <div className='flex h-screen bg-[#1e1e1e] text-white overflow-hidden'>
      {/* Sidebar - Fixed width */}
      <div className='w-[18%] bg-[#232327] flex-shrink-0 h-full overflow-y-auto'>
        <Sidebar />
      </div>
      
      {/* Main Content - Takes remaining space */}
      <div className='flex-1 flex flex-col h-full overflow-hidden'>
        <div className='flex-1 overflow-hidden'>
          <Prompt />
        </div>
      </div>
    </div>
  )
}

export default Home;