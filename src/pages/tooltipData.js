/* eslint-disable react-hooks/exhaustive-deps*/
import React from 'react';
import {
    Space,
} from 'antd';

// const { Text } = Typography;

export default [
    {
        label: '저작권 국내,해외 직계약',
        id: 'author',
        key: 'author_1',
        memo:   '<Space direction="vertical"><p type="secondary">유형이 한국인, 한국 거주 외국인인 경우에만 참고하세요. </p><p type="secondary">사업소득 : 고용관계 없이 독립적 지위에서 계속적, 반복적으로 용역을 제공하고 그 대가를 지급 받는 자 <br /><span style="margin-left: 10px;">* 저작권자, 번역 외주 등 다른 근로소득 없이 이 소득으로 생활하는 분이 해당됩니다.</span><br /><span style="margin-left: 10px;">* 다만, 본인이 원하는 경우 기타소득을 선택할 수 있습니다.</span></p> <p type="secondary">기타소득 : 일시적으로 용역을 제공하고 지급받는 자 <br /><span style="margin-left: 10px;">* 근로소득이 있는 분이거나 일회성 작업을 하는 경우에 해당됩니다.</span></p></Space>'    
            },  

    {
        label: '저작권 국내,해외 직계약',
        id: 'author',
        key: 'author_2',
        memo:   '<Space direction="vertical"><p type="secondary"> 세금 신고에 필요한 정보입니다. </p><p type="secondary">여권번호, 사회보장번호, TAX ID 등 알고 계신 정보가 있다면 적어주세요.</p></Space>'
    },  
    {
        label: '상품',
        id: 'product',
        key: 'product',
        memo:   '<Space direction="vertical"><p type="secondary"> 개정판, 종이책 기반 전자책/오디오북 등 이전 상품과 연결되는 경우 반드시 지정해 주세요.  </p><p type="secondary">매출 집계, 저작권료 정산 등에 필요합니다.</p></Space>'
    },  
    {
        label: '상품 - 파일',
        id: 'productFile',
        key: 'productFile_1',
        memo:   '<Space direction="vertical"><p type="secondary">편집 데이터 등 원본 파일을 등록합니다.</p><p type="secondary">인디자인 파일은 쇄별로 하나의 파일로 압축(.zip)해서 등록해 주세요.</p></Space>'
    }, 
    {
        label: '상품 - 파일',
        id: 'productFile',
        key: 'productFile_2',
        memo:   '<Space direction="vertical"><p type="secondary">타 부서와 공유에 필요한 파일을 등록합니다.</p><p type="secondary">웹용 표지는 아래 규격을 준수해 주세요.</p><p type="secondary">RGB 모드의 png 파일(불가피할 경우 jpg 가능)</p><p type="secondary">가로 크기는 최소 1000픽셀(px), 최대 3000픽셀</p><p type="secondary">본문 미리보기용 PDF는 재단선을 자른 뒤, \'PDF 압축\' 또는 \'파일 크기 축소\' 옵션을 사용해서 저장한 파일을 등록해 주세요.(인쇄용 원본은 파일 용량이 너무 큼)</p></Space>'
    }, 
    {
        label: '재무관리- 거래처관리',
        id: 'account',
        key: 'account',
        memo:   '<Space direction="vertical"><p type="secondary">사업소득 : 고용관계 없이 독립적 지위에서 계속적, 반복적으로 용역을 제공하고 그 대가를 지급 받는 자<br/><span style="margin-left: 10px;">* 저작권자, 번역 외주 등 다른 근로소득 없이 이 소득으로 생활하는 분이 해당됩니다.</span><br /><span style="margin-left: 10px;">* 다만, 본인이 원하는 경우 기타소득을 선택할 수 있습니다.</span></p><p type="secondary">기타소득 : 일시적으로 용역을 제공하고 지급받는 자<br /><span style="margin-left: 10px;">* 근로소득이 있는 분이거나 일회성 작업을 하는 경우에 해당됩니다.</span></p></Space>'
    }, 
    {
        label: '비용청구',
        id: 'billingApprovals',
        key: 'billingApprovals_1',
        memo:   '<Space direction="vertical"><p type="secondary">여러 개 추가할 수 있지만, 주의해 주세요.</p><p type="secondary">① 여러 상품 또는 부서/회사를 추가하면 비용은 1/n로 반영됩니다.<br/>(예: 합계 100만 원에 2개 상품을 추가하면 비용은 각각 50만 원씩 할당).</p><p type="secondary">② 비용 배분을 다르게 하려면 청구 내용을 분리해 주세요.</p><p type="secondary">③ 상품, 부서/회사 중 하나의 종류만 추가할 수 있습니다.</p></Space>'
    }, 
    {
        label: '비용청구',
        id: 'billingApprovals',
        key: 'billingApprovals_2',
        memo:   '<Space direction="vertical"><p type="secondary">등록된 거래처나 저작권자는 성명/사업자명, 주민/사업자/외국인번호 일부만 입력해도 찾을 수 있습니다.</p><p type="secondary">해외 거주자, 해외 사업자는 영어로 검색해 주세요.</p><p type="secondary">찾는 거래처가 없으면 \'거래처 새로 입력\'을 이용해 주세요. <br/>단, \"저작권자\"는 저작권자 등록 메뉴에서 가능합니다.</p></Space>'
    }, 
    {
        label: '비용청구',
        id: 'billingApprovals',
        key: 'billingApprovals_3',
        memo:   '<Space direction="vertical"><p type="secondary">서점 광고비 등 청구건을 모두 모아서 월 1회 모아서 지급하는 경우에만 \'맞음\'을 선택해 주세요.</p></Space>'
    }, 
    {
        label: '비용청구',
        id: 'billingApprovals',
        key: 'billingApprovals_4',
        memo:   '<Space direction="vertical"><p type="secondary">발급 받은 세금계산서/계산서/현금영수증의 “승인번호" 항목에 있는 값을 복사해서 붙여 넣으면 됩니다.</p></Space>'
    }, 
    {
        label: '비용청구',
        id: 'billingApprovals',
        key: 'billingApprovals_5',
        memo:   '<Space direction="vertical"><p type="secondary">승인: 결재자가 승인해야 다음으로 진행됩니다. 따라서 승인은 각 단계에서 한 명만 지정할 수 있습니다.</p><p type="secondary">참조: 해당 결재자는 참조만 하므로 결재 진행에 영향을 끼치지 않습니다.</p></Space>'
    }, 
    {
        label: '비용청구',
        id: 'billingApprovals',
        key: 'billingApprovals_6',
        memo:   '<Space direction="vertical"><p type="secondary">\'비용 전결 지침\'에 따라 결재자를 순서대로 지정해 주세요.(예: 1단계-팀장, 2단계-실장)</p></Space>'
    }, 
    {
        label: '저작권계약',
        id: 'contract',
        key: 'contract_1',
        memo:   '<Space direction="vertical"><p type="secondary">&#9632; 단일한 비율로 지급 시</p><p type="secondary">    > 구간의 “끝까지" 항목 앞을 체크하고 정산 비율을 입력</p><p type="secondary">&#9632; 구간별로 지급 시</p><p type="secondary">    > 해당 부수와 정산 비율을 입력하고, </p><p type="secondary">    > + 버튼을 눌러서 구간을 계속 추가 후 마지막 구간에는 “끝까지" 항목 앞을 체크</p></Space>'
    }, 
    {
        label: '저작권계약',
        id: 'contract',
        key: 'contract_2',
        memo:   '<Space direction="vertical"><p type="secondary">중개자가 있고, 저작권료를 중개자에게 지급하는 경우에 지정해 주세요.</p></Space>'
    },
    {
        label: '저작권계약',
        id: 'contract',
        key: 'contract_3',
        memo:   '<Space direction="vertical"><p type="secondary">이 계약에 등록된 다른 저작권자의 세부 계약 정보를 불러와서 수정할 수 있습니다.</p></Space>'
    }, 
    {
        label: '저작권계약',
        id: 'contract',
        key: 'contract_4',
        memo:   '<Space direction="vertical"><p type="secondary">계약할 때 한 번 지급하는 “중개" 수수료가 아니라, 정기 저작권료를 지급할 때마다 발생하는 “저작권료" 수수료로, 발생 저작권료(로열티) 대비 일정 비율로 계약합니다.</p></Space>'
    },
    {
        label: '저작권계약',
        id: 'contract',
        key: 'contract_5',
        memo:   '<span class="ant-typography ant-typography-secondary">- 세부 저작권자/상품별 계약 중 30일 이내에 종료되는 건이 있는지 표시합니다.</span>'
    },
    {
        label: '제작시뮬레이션',
        id: 'simulation',
        key: 'simulation_0',
        memo:   '<span class="ant-typography ant-typography-secondary"><p>- 예상 제작비를 반영하기 때문에 현재 실제 제작비와는 다를 수 있습니다.</p>'
        +'<p>- 전체 비용 비율, 제작비 비율은 정가 대비 비율입니다.</p>'
        +'<p>- 공급가는 해당 상품 귀속 부서의 평균 공급률을 적용합니다.</p>'
        +'<p>- ‘정가’는 수정 즉시, 개발비/기타, 제작비는 ‘적용’ 버튼 클릭 후 결과를 다시<br /> 계산합니다. 변경되면 이전 값을 아래에 보여줍니다.</p>'
        +'<p>- ‘확인’ 버튼을 클릭해야 변경 사항이 저장됩니다.</p></span>',
    },
    {
        label: '제작시뮬레이션',
        id: 'simulation',
        key: 'simulation_1',
        memo:   '<span class="ant-typography ant-typography-secondary"><p>- 구성과 공정에 따라 제작비는 ‘단가 X 제작 수량’이 아닐 수도 있습니다. 예를 들어 종이는 연(Roll)당<br /> 단가를 표시하며, 실제로는 다양한 수식으로 제작비를 계산합니다.</p>'
        +'<p>- 선택 사양이 제작비와 직접 연결되지 않는 경우 단가와 제작비가 ‘0’으로 표시될 수 있습니다.</p></span>',
    },
    {
        label: '제작시뮬레이션',
        id: 'simulation',
        key: 'simulation_2',
        memo:   '<span class="ant-typography ant-typography-secondary"><p>- 여러 기본 구성을 합본하는 옵션을 지정합니다.</p><p>- 합본에는 띠지를 추가할 수 없습니다.</p></span>',
    },
];
