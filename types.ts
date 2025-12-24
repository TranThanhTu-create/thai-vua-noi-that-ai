
export enum RoomType {
  LivingRoom = 'Phòng khách',
  Bedroom = 'Phòng ngủ',
  Kitchen = 'Phòng bếp',
  DiningRoom = 'Phòng ăn',
  Bathroom = 'Phòng tắm',
  Office = 'Phòng làm việc',
  FullHouse = 'Căn hộ Studio'
}

export enum DesignStyle {
  Modern = 'Hiện đại',
  Neoclassical = 'Tân cổ điển',
  Minimalist = 'Tối giản',
  Indochine = 'Đông Dương (Indochine)',
  Scandinavian = 'Bắc Âu',
  Industrial = 'Công nghiệp (Industrial)'
}

export interface DesignSuggestion {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  estimatedCost: string;
}

export interface DesignFormData {
  roomType: RoomType;
  style: DesignStyle;
  budget: string;
  image: string | null;
  requirements: string; // Trường mới thay thế kích thước
}
