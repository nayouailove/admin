function GuideView() {
  return (
    <div className="workspace">
      <header className="workspaceHeader">
        <div>
          <p className="eyebrow">도움말</p>
          <h1>사용 가이드</h1>
        </div>
      </header>

      <section className="guideSection">
        <h2>학생 한 명씩 등록하기</h2>
        <p>
          "학생 관리" 화면 상단의 학생 ID, 학생 이름 칸을 채우고 등록 버튼을
          누르면 바로 등록됩니다.
        </p>
      </section>

      <section className="guideSection">
        <h2>여러 명 한 번에 등록하기 (일괄 등록)</h2>
        <p>
          "일괄 등록" 링크를 눌러 엑셀(.xlsx) 또는 CSV 파일을 업로드하면,
          어느 열이 학생 ID이고 이름인지 직접 선택해서 여러 명을 한 번에
          등록할 수 있습니다.
        </p>
      </section>

      <section className="guideSection">
        <h2>일괄 등록용 엑셀 파일 작성 규칙</h2>
        <p>업로드할 파일은 아래 조건을 만족해야 정상적으로 인식됩니다.</p>
        <ul>
          <li>
            첫 번째 행에는 제목이 아니라, 실제 열 이름(학번, 이름 등)이
            있어야 합니다. (2번째 행부터 학생 데이터가 이어지는 건
            정상입니다.)
          </li>
          <li>데이터는 첫 번째 시트에 있어야 합니다.</li>
          <li>같은 이름의 열이 두 번 이상 있으면 안 됩니다.</li>
          <li>병합된 셀이 없어야 합니다.</li>
        </ul>

        <p className="guideWarningTitle">아래 경우에는 인식이 안 됩니다 — 이런 파일이면 제공하는 템플릿을 이용해주세요.</p>
        <ul className="guideWarningList">
          <li>
            <strong>1행에 헤더가 아닌 다른 글씨가 있는 경우</strong> — 1행에
            "○○학원 학생 명단" 같은 제목이 적혀 있고, 진짜 열 이름(학번,
            이름)은 2행에 있는 경우. 시스템은 무조건 1행을 헤더로 읽기
            때문에, 제목을 "학번"·"이름"으로 잘못 인식해버립니다.
          </li>
          <li>
            <strong>데이터가 다른 시트에 있는 경우</strong> — "Sheet2"나
            "학생목록" 같은, 첫 번째 시트가 아닌 다른 시트에 데이터가 있는
            경우
          </li>
          <li>
            <strong>헤더 행이 전혀 없는 경우</strong> — 1행부터 바로 학생
            데이터가 시작되는 경우
          </li>
          <li>
            <strong>셀이 병합되어 있는 경우</strong> — 예를 들어 1행에서
            "학생 정보"라는 제목이 두 칸(학번/이름 칸)에 걸쳐 합쳐져 있으면,
            겉보기엔 두 칸 다 채워진 것처럼 보여도 실제로는 합쳐진 칸들
            중 첫 번째 칸에만 값이 들어있고 나머지는 빈 칸으로 처리됩니다.
            그래서 그 아래에 있는 진짜 헤더(학번, 이름)나 데이터 일부가
            누락된 것처럼 읽혀요.
          </li>
        </ul>
        <p>
          이런 파일을 그대로 올리면 첫 행이 잘못 인식되어 학생 정보가 깨질 수
          있습니다. 일괄 등록 화면의 <strong>"다운로드"</strong> 링크에서
          정해진 양식을 받아, 그 양식에 학생 정보를 옮겨 적은 뒤
          업로드해주세요.
        </p>
      </section>

      <section className="guideSection">
        <h2>학생 찾기 (검색)</h2>
        <p>
          "검색" 링크를 누르면 입력창이 검색용으로 바뀝니다. ID나 이름을
          입력하면 입력하는 즉시 목록이 좁혀지고, 칸을 비우면 다시 전체
          목록이 보입니다.
        </p>
      </section>

      <section className="guideSection">
        <h2>학생 삭제 시 주의할 점</h2>
        <p>
          학생을 삭제해도 그 학생의 계정 자체는 남아있습니다. 같은 ID로 다시
          등록할 때는 처음 등록했던 이름과 정확히 똑같이 입력해야 등록이
          됩니다. 이름이 다르면 "이미 등록되어 있는 ID입니다" 오류가 발생할
          수 있습니다.
        </p>
      </section>

      <section className="guideSection">
        <h2>비밀번호 초기화 방법</h2>
        <p>
          초기 비밀번호는 0000이며, 변경할 수 있습니다. 기억이 나지 않을
          때는 관리자에게 초기화를 요청하세요.
        </p>
      </section>
    </div>
  );
}

export default GuideView;
