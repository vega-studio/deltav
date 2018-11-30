import { Instance } from "../instance-provider/instance";

/**
 * The point of Bulk editing is to adjust large amounts of objects without causing significant
 * frame rate drops. This accomplishes it by spreading out changes across multiple frames.
 *
 * In the event of animated items, this utility provides some methods to help attain desired
 * effects that have synchronized timings to spread out the commits but have large amounts of
 * data arrive at a destination in a properly synchronized fashion. This can causes some additional
 * lead up time to the animation beginning, but once the animations start, the operation will be
 * within proper time frames.
 */
export class BulkEditController {

}

export function bulkEdit(items: Instance[]) {

}
