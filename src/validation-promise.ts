/**
 * MIS async validation promise module
 * @author Frederic BAYLE
 */

type ResolveCbType<T> = (result: T) => void;
type RejectCbType = (error: Error) => void;
type FinallyCbType = () => void;

/**
 * MIS async validation promise
 */
export class ValidationPromise<T> {

  /**
   * FInaly callback function
   */
  protected _finallyCb: FinallyCbType = () => {};

  /**
   * Reject callback function
   */
  protected _rejectCb: RejectCbType = (error) => {};

  /**
   * Resolve callback function
   */
  protected _resolveCb: ResolveCbType<T> = (result) => {};
  
  /**
   * Set the catch callback function
   * @param pRejectCb Reject callback function
   */
  public catch(pRejectCb: RejectCbType) {
    this._rejectCb = (error) => {
      pRejectCb(error);
      this._finallyCb();
    };
    return this;
  }

  /**
   * Set the finally callback function
   * @param pFinallyCb Finally callback function
   */
  public finally(pFinallyCb: FinallyCbType) {
    this._finallyCb = pFinallyCb;
    return this;
  }

  /**
   * Set the resolve callback function
   * @param pResolveCb Resolve callback function
   */
  public then(pResolveCb: ResolveCbType<T>) {
    this._resolveCb = (result) => {
      pResolveCb(result);
      this._finallyCb();
    };
    return this;
  }

  /**
   * Class constructor
   * @param pPromiseCb  Callback function called on promise construction 
   */
  constructor(pPromiseCb: (resolve: ResolveCbType<T>, reject: RejectCbType) => void) {
    setTimeout(() => { pPromiseCb(this._resolveCb, this._rejectCb); }, 0);
  }
}