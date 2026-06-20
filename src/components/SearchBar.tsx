import React from 'react';
import {
  IonIcon,
  IonButton
} from '@ionic/react';
import { search } from 'ionicons/icons';
import './SearchBar.css';

interface SearchBarProps {
  onSearchClick?: () => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearchClick, 
  placeholder = "Buscar productos...",
  className = ""
}) => {
  const handleClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <div 
      className={`search-bar-simple ${className}`} 
      onClick={handleClick}
    >
      <div className="search-bar-content">
        <IonIcon icon={search} className="search-icon" />
        <span className="search-placeholder">{placeholder}</span>
      </div>
    </div>
  );
};

export default SearchBar;