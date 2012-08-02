/**
 * @author Ajay
 */

function setImageURL(url) {
	if(confirm("This will reset the process. Continue?")) {
		confirm("Resetting...")
		changeSourceImage(url);
	}
}
