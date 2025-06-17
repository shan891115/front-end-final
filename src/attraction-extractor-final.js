// 改進的景點提取邏輯
// 專門解決雲端行程中粗體字景點名稱無法正確提取的問題

export function extractAttractionsFromItinerary(dayNumber, content) {
  if (!content) return [];
  
  console.log(`開始提取第${dayNumber}天的景點`);
  
  // 步驟1: 按天分割內容
  const dayRegex = new RegExp(`# 第${dayNumber}天[\\s\\S]*?(?=# 第\\d+天|$)`, 'i');
  const dayMatch = content.match(dayRegex);
  
  if (!dayMatch) {
    console.log(`未找到第${dayNumber}天的內容`);
    return [];
  }
  
  const dayContent = dayMatch[0];
  console.log(`找到第${dayNumber}天內容，長度: ${dayContent.length}`);
    // 步驟2: 只提取"## 行程"標題下的內容
  const itineraryRegex = /## 行程([\s\S]*?)(?=##|$)/i;
  const itineraryMatch = dayContent.match(itineraryRegex);
  
  if (!itineraryMatch) {
    console.log(`未找到"## 行程"標題`);
    console.log(`dayContent 內容預覽: ${dayContent.substring(0, 200)}...`);
    return [];
  }
  
  const itineraryContent = itineraryMatch[1].trim();
  console.log(`找到行程內容，長度: ${itineraryContent.length}`);
  console.log(`行程內容預覽: ${itineraryContent.substring(0, 200)}...`);
  
  // 步驟3: 只提取行程內容中的景點名稱
  const attractions = new Set();
  
  // 匹配 **景點名**(英文名) 格式
  const fullPattern = /\*\*([^*]+)\*\*\s*\(([^)]+)\)/g;
  let match;
  
  while ((match = fullPattern.exec(itineraryContent)) !== null) {
    const chineseName = match[1].trim();
    const englishName = match[2].trim();
    const fullName = `${chineseName} (${englishName})`;
    console.log(`找到完整景點: ${fullName}`);
    attractions.add(fullName);
  }
    // 匹配 **景點名** 格式（沒有英文名）
  const simplePattern = /\*\*([^*]+)\*\*/g;
  
  while ((match = simplePattern.exec(itineraryContent)) !== null) {
    const name = match[1].trim();
    
    // 跳過已經處理過的景點（避免重複）
    let alreadyExists = false;
    for (const existing of attractions) {
      if (existing.includes(name)) {
        alreadyExists = true;
        break;
      }
    }
    
    // 只保留真正的景點名稱，排除時間、動作等詞彙
    if (!alreadyExists && 
        name.length > 1 && 
        !name.match(/^(?:上午|下午|傍晚|晚上|早餐|午餐|晚餐|抵達|前往|搭乘|步行|欣賞|品嚐|觀看|辦理|稍作|休息|費用|之後).*$/)) {
      console.log(`找到純中文景點: ${name}`);
      attractions.add(name);
    }
  }
  
  // 轉換為最終格式
  console.log(`最終景點列表 (共${attractions.size}個)`);
  const finalAttractions = [];
  let index = 1;
  
  for (const name of attractions) {
    finalAttractions.push({
      id: `day${dayNumber}_attr${index}`,
      name: name,
      description: `第${dayNumber}天的遊覽景點`
    });
    index++;
    
    if (index > 8) break;
  }
  
  // 如果沒有找到景點，添加默認景點
  if (finalAttractions.length === 0) {
    finalAttractions.push(
      { id: `day${dayNumber}_default1`, name: '上午景點', description: '當天上午的主要景點' },
      { id: `day${dayNumber}_default2`, name: '下午景點', description: '當天下午的主要景點' }
    );
  }
  
  console.log(`第${dayNumber}天最終確定了${finalAttractions.length}個景點`);
  return finalAttractions;
}
