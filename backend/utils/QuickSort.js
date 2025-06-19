class QuickSort {
  static sort(arr, compareFn) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[0];
    const left = [];
    const right = [];
    
    for (let i = 1; i < arr.length; i++) {
      if (compareFn(arr[i], pivot) <= 0) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
    
    return [
      ...this.sort(left, compareFn),
      pivot,
      ...this.sort(right, compareFn)
    ];
  }
  
  static inPlaceSort(arr, compareFn, left = 0, right = arr.length - 1) {
    if (left >= right) return;
    
    const pivotIndex = this.partition(arr, compareFn, left, right);
    this.inPlaceSort(arr, compareFn, left, pivotIndex - 1);
    this.inPlaceSort(arr, compareFn, pivotIndex + 1, right);
    
    return arr;
  }
  
  static partition(arr, compareFn, left, right) {
    const pivot = arr[right];
    let i = left - 1;
    
    for (let j = left; j < right; j++) {
      if (compareFn(arr[j], pivot) <= 0) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
  }
  
  static sortByProperty(arr, prop, ascending = true) {
    const compareFn = (a, b) => {
      if (a[prop] < b[prop]) return ascending ? -1 : 1;
      if (a[prop] > b[prop]) return ascending ? 1 : -1;
      return 0;
    };
    
    return this.sort([...arr], compareFn);
  }
  
  static sortByMultipleProperties(arr, sortCriteria) {
    const compareFn = (a, b) => {
      for (const { prop, ascending } of sortCriteria) {
        if (a[prop] < b[prop]) return ascending ? -1 : 1;
        if (a[prop] > b[prop]) return ascending ? 1 : -1;
      }
      return 0;
    };
    
    return this.sort([...arr], compareFn);
  }
}

module.exports = QuickSort;
