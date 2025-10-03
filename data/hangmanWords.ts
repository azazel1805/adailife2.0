export interface HangmanWord {
  word: string;
  definition: string;
}

export const hangmanWords: { [key: string]: HangmanWord[] } = {
  'Kolay': [
    { word: 'CAT', definition: 'A small domesticated carnivorous mammal with soft fur.' },
    { word: 'DOG', definition: 'A domesticated carnivorous mammal that typically has a long snout.' },
    { word: 'SUN', definition: 'The star around which the earth orbits.' },
    { word: 'SKY', definition: 'The region of the atmosphere and outer space seen from the earth.' },
    { word: 'RED', definition: 'The color of blood or fire.' },
    { word: 'BLUE', definition: 'The color of the sky on a clear day.' },
    { word: 'RUN', definition: 'Move at a speed faster than a walk.' },
    { word: 'EAT', definition: 'Put food into the mouth and chew and swallow it.' },
    { word: 'BIG', definition: 'Of considerable size, extent, or intensity.' },
    { word: 'HOT', definition: 'Having a high degree of heat or a high temperature.' },
    { word: 'BALL', definition: 'A solid or hollow spherical or ovoid object.' },
    { word: 'TREE', definition: 'A woody perennial plant, typically having a single stem or trunk.' },
    { word: 'BOOK', definition: 'A written or printed work consisting of pages glued or sewn together.' },
    { word: 'FISH', definition: 'A limbless cold-blooded vertebrate animal with gills and fins.' },
    { word: 'HAND', definition: 'The end part of a person\'s arm beyond the wrist.' },
    { word: 'LOVE', definition: 'An intense feeling of deep affection.' },
    { word: 'RAIN', definition: 'Moisture condensed from the atmosphere that falls visibly in separate drops.' },
    { word: 'SONG', definition: 'A short poem or other set of words set to music.' },
    { word: 'STAR', definition: 'A fixed luminous point in the night sky that is a large, remote incandescent body.' },
    { word: 'WATER', definition: 'A colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain.' }
  ],
  'Orta': [
    { word: 'APPLE', definition: 'The round fruit of a tree of the rose family.' },
    { word: 'BEACH', definition: 'A pebbly or sandy shore, especially by the ocean.' },
    { word: 'CHAIR', definition: 'A separate seat for one person, typically with a back and four legs.' },
    { word: 'EARTH', definition: 'The planet on which we live; the world.' },
    { word: 'FRIEND', definition: 'A person with whom one has a bond of mutual affection.' },
    { word: 'GREEN', definition: 'The color between blue and yellow in the spectrum.' },
    { word: 'HAPPY', definition: 'Feeling or showing pleasure or contentment.' },
    { word: 'HOUSE', definition: 'A building for human habitation.' },
    { word: 'MUSIC', definition: 'Vocal or instrumental sounds combined in such a way as to produce beauty of form.' },
    { word: 'OCEAN', definition: 'A very large expanse of sea.' },
    { word: 'PAPER', definition: 'Material manufactured in thin sheets from the pulp of wood or other fibrous substances.' },
    { word: 'PARTY', definition: 'A social gathering of invited guests.' },
    { word: 'PHONE', definition: 'A system for transmitting voices over a distance using wire or radio.' },
    { word: 'RIVER', definition: 'A large natural stream of water flowing in a channel to the sea, a lake, or another river.' },
    { word: 'SMILE', definition: 'A pleased, kind, or amused facial expression.' },
    { word: 'STORE', definition: 'A place where things are sold.' },
    { word: 'TABLE', definition: 'A piece of furniture with a flat top and one or more legs.' },
    { word: 'TIGER', definition: 'A very large solitary cat with a yellow-brown coat striped with black.' },
    { word: 'WHITE', definition: 'The color of milk or fresh snow.' },
    { word: 'WOMAN', definition: 'An adult female human being.' }
  ],
  'Zor': [
    { word: 'BEAUTIFUL', definition: 'Pleasing the senses or mind aesthetically.' },
    { word: 'CHALLENGE', definition: 'A call to take part in a contest or competition.' },
    { word: 'COMPUTER', definition: 'An electronic device for storing and processing data.' },
    { word: 'DIFFICULT', definition: 'Needing much effort or skill to accomplish, handle, or understand.' },
    { word: 'EDUCATION', definition: 'The process of receiving or giving systematic instruction.' },
    { word: 'ENVIRONMENT', definition: 'The surroundings or conditions in which a person, animal, or plant lives.' },
    { word: 'EXCELLENT', definition: 'Extremely good; outstanding.' },
    { word: 'GOVERNMENT', definition: 'The governing body of a nation, state, or community.' },
    { word: 'IMPORTANT', definition: 'Of great significance or value.' },
    { word: 'KNOWLEDGE', definition: 'Facts, information, and skills acquired through experience or education.' },
    { word: 'LANGUAGE', definition: 'The method of human communication, either spoken or written.' },
    { word: 'OPPORTUNITY', definition: 'A set of circumstances that makes it possible to do something.' },
    { word: 'RESTAURANT', definition: 'A place where people pay to sit and eat meals that are cooked and served on the premises.' },
    { word: 'SCIENTIST', definition: 'A person who is studying or has expert knowledge of one or more of the natural or physical sciences.' },
    { word: 'TECHNOLOGY', definition: 'The application of scientific knowledge for practical purposes.' },
    { word: 'UNDERSTAND', definition: 'Perceive the intended meaning of (words, a language, or a speaker).' },
    { word: 'UNIVERSITY', definition: 'An institution of higher (or tertiary) education and research which awards academic degrees.' },
    { word: 'WONDERFUL', definition: 'Inspiring delight, pleasure, or admiration; extremely good; marvelous.' },
    { word: 'YESTERDAY', definition: 'On the day before today.' },
    { word: 'CHOCOLATE', definition: 'A food preparation in the form of a paste or solid block made from roasted and ground cacao seeds.' }
  ]
};
