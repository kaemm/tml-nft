function updateCharts() {
  let currency = document.querySelector('input[name="currency"]:checked').value;
  if (!currency) {
    currency = 'eur';
  }
  let currencyText = '...';
  switch (currency) {
  case 'sol':
    chartFloor.data.datasets = datasetsFloorSol;
    chartTotal.options.parsing.yAxisKey = 'total_floor';
    currencyText = 'Sol';
    break;
  case 'usd':
    chartFloor.data.datasets = datasetsFloorUsd;
    chartTotal.options.parsing.yAxisKey = 'total_floor_usd';
    currencyText = 'USD';
    break;
  case 'eur':
  default:
    chartFloor.data.datasets = datasetsFloorEur;
    chartTotal.options.parsing.yAxisKey = 'total_floor_eur';
    currencyText = 'EUR';
    break;
  }
  chartTotal.data.datasets[0].label = 'Total Medallion price (' + currencyText + ')';
  chartFloor.update();
  chartTotal.update();
  for (const el of document.querySelectorAll('.currencyText')) {
    el.innerHTML = currencyText;
  }
}